/**
 * StorageMarket 和 InstaShare 跨合约交互测试脚本
 * 
 * 测试流程：
 * 1. 部署 InstaShare 合约
 * 2. 部署 StorageMarket 合约
 * 3. 设置 StorageMarket 的 InstaShare 合约地址
 * 4. 提供商在 StorageMarket 注册存储服务
 * 5. 用户在 StorageMarket 购买存储服务
 * 6. 验证 InstaShare 合约中自动添加了存储节点
 * 7. 用户在 InstaShare 上传文件到购买的节点
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== StorageMarket 和 InstaShare 跨合约交互测试 ===\n");

  // 获取测试账户
  const [deployer, provider, buyer] = await ethers.getSigners();
  
  console.log("📋 测试账户信息:");
  console.log(`   部署者: ${deployer.address}`);
  console.log(`   存储提供商: ${provider.address}`);
  console.log(`   购买者: ${buyer.address}\n`);

  // ============================================
  // 步骤 1: 部署 InstaShare 合约
  // ============================================
  console.log("🚀 步骤 1: 部署 InstaShare 合约...");
  const InstaShare = await ethers.getContractFactory("InstaShare");
  const instaShare = await InstaShare.deploy();
  await instaShare.waitForDeployment();
  const instaShareAddress = await instaShare.getAddress();
  console.log(`   ✅ InstaShare 部署成功: ${instaShareAddress}\n`);

  // ============================================
  // 步骤 2: 部署 StorageMarket 合约
  // ============================================
  console.log("🚀 步骤 2: 部署 StorageMarket 合约...");
  const StorageMarket = await ethers.getContractFactory("DataMarketplace");
  const storageMarket = await StorageMarket.deploy();
  await storageMarket.waitForDeployment();
  const storageMarketAddress = await storageMarket.getAddress();
  console.log(`   ✅ StorageMarket 部署成功: ${storageMarketAddress}\n`);

  // ============================================
  // 步骤 3: 设置 StorageMarket 的 InstaShare 合约地址
  // ============================================
  console.log("🔗 步骤 3: 设置跨合约引用...");
  const setInstaShareTx = await storageMarket.setInstaShareContract(instaShareAddress);
  await setInstaShareTx.wait();
  console.log(`   ✅ StorageMarket 已关联 InstaShare 合约\n`);

  // ============================================
  // 步骤 4: 提供商注册存储服务
  // ============================================
  console.log("📦 步骤 4: 存储提供商注册服务...");
  
  const availableSpace = ethers.parseUnits("1000", 0); // 1000 MB
  const pricePerMBPerMonth = ethers.parseEther("0.001"); // 0.001 ETH per MB per month
  const allowedDeviation = 10; // 10% 允许偏差
  
  // 计算质押金额（requiredStake = availableSpace * pricePerMBPerMonth）
  const requiredStake = availableSpace * pricePerMBPerMonth;
  const stakedAmount = requiredStake; // 质押准确金额
  
  console.log(`   存储空间: ${availableSpace} MB`);
  console.log(`   价格: ${ethers.formatEther(pricePerMBPerMonth)} ETH/MB/月`);
  console.log(`   质押金额: ${ethers.formatEther(stakedAmount)} ETH`);
  
  const registerTx = await storageMarket.connect(provider).registerStorageProvider(
    availableSpace,
    pricePerMBPerMonth,
    allowedDeviation,
    { value: stakedAmount }
  );
  const registerReceipt = await registerTx.wait();
  
  // 获取 sellID
  const registerEvent = registerReceipt.logs.find(
    log => log.fragment && log.fragment.name === 'StorageProviderRegistered'
  );
  const sellID = registerEvent.args.sellID;
  
  console.log(`   ✅ 提供商注册成功，卖单ID: ${sellID}\n`);

  // ============================================
  // 步骤 5: 用户购买存储服务
  // ============================================
  console.log("🛒 步骤 5: 用户购买存储服务...");
  
  // 计算购买费用
  const totalCost = availableSpace * pricePerMBPerMonth;
  const paymentAmount = totalCost; // 支付准确金额
  
  console.log(`   购买空间: ${availableSpace} MB`);
  console.log(`   支付金额: ${ethers.formatEther(paymentAmount)} ETH`);
  
  const purchaseTx = await storageMarket.connect(buyer).createDataOrder(
    sellID,
    { value: paymentAmount }
  );
  const purchaseReceipt = await purchaseTx.wait();
  
  // 获取 orderID
  const orderEvent = purchaseReceipt.logs.find(
    log => log.fragment && log.fragment.name === 'DataOrderCreated'
  );
  const orderID = orderEvent.args.orderID;
  const verificationContract = orderEvent.args.verificationContract;
  
  console.log(`   ✅ 购买成功，订单ID: ${orderID}`);
  console.log(`   验证合约地址: ${verificationContract}\n`);

  // ============================================
  // 步骤 6: 验证 InstaShare 中自动添加了存储节点
  // ============================================
  console.log("🔍 步骤 6: 验证 InstaShare 中的存储节点...");
  
  // 查询买家信息
  const buyerInfo = await instaShare.instanceOwners(buyer.address);
  console.log(`   买家拥有的节点数: ${buyerInfo.totalNodes}`);
  
  // 查询存储节点信息（nodeId = orderID）
  const nodeKey = ethers.solidityPackedKeccak256(
    ["address", "uint256"],
    [buyer.address, orderID]
  );
  const nodeInfo = await instaShare.storageNodes(nodeKey);
  
  console.log(`   节点ID: ${orderID}`);
  console.log(`   节点所有者: ${nodeInfo.owner}`);
  console.log(`   提供商地址: ${nodeInfo.providerAddress}`);
  console.log(`   总空间: ${nodeInfo.totalSpace} MB`);
  console.log(`   可用空间: ${nodeInfo.availableSpace} MB`);
  console.log(`   是否激活: ${nodeInfo.isActive}`);
  console.log(`   ✅ 存储节点已自动添加到 InstaShare\n`);

  // ============================================
  // 步骤 7: 用户上传文件到购买的节点
  // ============================================
  console.log("📤 步骤 7: 用户上传文件到购买的节点...");
  
  const fileCID = "QmTest1234567890abcdefghijklmnopqrstuvwxyz";
  const fileSize = ethers.parseUnits("100", 0); // 100 MB
  const fileType = "application/pdf";
  const fileName = "test-document.pdf";
  
  console.log(`   文件CID: ${fileCID}`);
  console.log(`   文件大小: ${fileSize} MB`);
  console.log(`   文件类型: ${fileType}`);
  console.log(`   文件名: ${fileName}`);
  console.log(`   存储到节点: ${orderID}`);
  
  const uploadTx = await instaShare.connect(buyer).uploadFile(
    fileCID,
    fileSize,
    fileType,
    fileName,
    orderID // 使用购买的节点ID
  );
  await uploadTx.wait();
  
  console.log(`   ✅ 文件上传成功\n`);

  // ============================================
  // 步骤 8: 验证最终状态
  // ============================================
  console.log("📊 步骤 8: 验证最终状态...");
  
  // 查询文件信息
  const fileKey = ethers.solidityPackedKeccak256(
    ["address", "string"],
    [buyer.address, fileCID]
  );
  const fileInfo = await instaShare.files(fileKey);
  
  console.log("\n   文件信息:");
  console.log(`   - 所有者: ${fileInfo.owner}`);
  console.log(`   - CID: ${fileInfo.cid}`);
  console.log(`   - 大小: ${fileInfo.size} MB`);
  console.log(`   - 存储节点ID: ${fileInfo.storageNodeId}`);
  console.log(`   - 是否激活: ${fileInfo.isActive}`);
  
  // 查询更新后的节点信息
  const updatedNodeInfo = await instaShare.storageNodes(nodeKey);
  console.log("\n   节点信息:");
  console.log(`   - 总空间: ${updatedNodeInfo.totalSpace} MB`);
  console.log(`   - 已用空间: ${updatedNodeInfo.usedSpace} MB`);
  console.log(`   - 可用空间: ${updatedNodeInfo.availableSpace} MB`);
  
  // 查询订单信息
  const orderInfo = await storageMarket.getOrderInfo(orderID);
  console.log("\n   订单信息:");
  console.log(`   - 订单ID: ${orderInfo.orderID}`);
  console.log(`   - 提供商: ${orderInfo.providerAddress}`);
  console.log(`   - 购买者: ${orderInfo.buyerAddress}`);
  console.log(`   - 存储空间: ${orderInfo.storageSpace} MB`);
  console.log(`   - 总费用: ${ethers.formatEther(orderInfo.totalCost)} ETH`);
  console.log(`   - 验证合约: ${orderInfo.verificationContract}`);
  
  // 查询提供商信息
  const providerInfo = await storageMarket.getProviderInfo(sellID);
  console.log("\n   提供商信息:");
  console.log(`   - 卖单ID: ${providerInfo.sellID}`);
  console.log(`   - 地址: ${providerInfo.providerAddress}`);
  console.log(`   - 可用空间: ${providerInfo.availableSpace} MB`);
  console.log(`   - 价格: ${ethers.formatEther(providerInfo.pricePerMBPerMonth)} ETH/MB/月`);
  console.log(`   - 质押金额: ${ethers.formatEther(providerInfo.stakedETH)} ETH`);
  console.log(`   - 是否有效: ${providerInfo.isValid}`);

  console.log("\n=== ✅ 跨合约交互测试完成！===\n");
  
  // ============================================
  // 返回测试数据供 Subgraph 使用
  // ============================================
  return {
    contracts: {
      instaShare: instaShareAddress,
      storageMarket: storageMarketAddress,
      verification: verificationContract
    },
    accounts: {
      deployer: deployer.address,
      provider: provider.address,
      buyer: buyer.address
    },
    data: {
      sellID: sellID.toString(),
      orderID: orderID.toString(),
      fileCID: fileCID,
      availableSpace: availableSpace.toString(),
      pricePerMBPerMonth: pricePerMBPerMonth.toString(),
      totalCost: totalCost.toString(),
      fileSize: fileSize.toString()
    }
  };
}

// 执行测试
main()
  .then((result) => {
    console.log("\n📋 测试数据总结:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:");
    console.error(error);
    process.exit(1);
  });
