// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IInstaShare {
    function addStorageNode(uint256 nodeId, address providerAddress, uint256 totalSpace) external;
}

contract DataMarketplace {
    address public instaShareContract; // InstaShare合约地址
    // --- 数据结构 ---
    struct StorageProvider {
        uint256 sellID; // 卖单ID
        address providerAddress; // 提供商的以太坊地址
        uint256 availableSpace; // 可用存储空间 (MB)
        uint256 pricePerMBPerMonth; // 每MB每月的价格 (wei)
        uint256 stakedETH; // 质押的 ETH (wei)
        bool isValid; // 存储提供商是否有效
    }

    struct DataOrder {
        uint256 orderID;  // 订单ID
        address providerAddress; // 存储服务提供商地址
        address buyerAddress;  // 服务购买者地址
        uint256 storageSpace;  // 购买的存储空间 (MB)
        uint256 totalCost;  // 订单总成本 (wei)
        uint256 stakedETH; // 购买时质押的 ETH (wei)
        address verificationContract; // 存储验证合约地址
    }

    // --- 状态变量 ---
    mapping(uint256 => StorageProvider) public storageProviders; // 使用卖单ID映射到存储卖单信息
    mapping(uint256 => DataOrder) public dataOrders; // 使用订单ID映射到数据订单信息
    mapping(address => uint256[]) public userOrders; // 用户购买的订单列表
    uint256 public nextSellID; // 用于生成唯一的卖单ID
    uint256 public nextOrderID; // 用于生成唯一的订单ID
    address public owner; // 合约所有者

    // --- 事件 ---
    event StorageProviderRegistered(
        uint256 sellID,
        address providerAddress,
        uint256 availableSpace,
        uint256 pricePerMBPerMonth,
        uint256 stakedETH 
    );

    event DataOrderCreated(
        uint256 orderID,
        address providerAddress,
        address buyerAddress,
        uint256 storageSpace,
        uint256 totalCost,
        uint256 stakedETH,
        address verificationContract
    );

    event InstaShareContractUpdated(address newAddress);

    // --- 构造函数 ---
    constructor() {
        owner = msg.sender;
    }

    // --- 修饰器 ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }


    function registerStorageProvider(uint256 availableSpace, uint256 pricePerMBPerMonth, uint256 allowedDeviationPercentage) public payable {
        // 计算需要的质押金额
        uint256 requiredStake = availableSpace * pricePerMBPerMonth;
        uint256 minStake = requiredStake - (requiredStake * allowedDeviationPercentage / 100);
        uint256 maxStake = requiredStake + (requiredStake * allowedDeviationPercentage / 100);

        // 检查质押金额是否在允许的范围内
        require(msg.value >= minStake && msg.value <= maxStake, "Staked ETH must be within the allowed deviation percentage of the required stake.");

         // 生成新的卖单 ID
        nextSellID++;
        uint256 sellID = nextSellID;

        // 创建新的存储提供商
        StorageProvider storage provider = storageProviders[sellID];
        provider.sellID = sellID;
        provider.providerAddress = msg.sender;
        provider.availableSpace = availableSpace;
        provider.pricePerMBPerMonth = pricePerMBPerMonth;
        provider.stakedETH = msg.value;
        provider.isValid = true;

          // 触发事件
        emit StorageProviderRegistered(sellID, msg.sender, availableSpace, pricePerMBPerMonth, msg.value);
    }

   function createDataOrder(uint256 sellID) public payable {
        // 验证存储服务提供商是否存在
        require(storageProviders[sellID].providerAddress != address(0), "Storage provider not found");

        // 验证存储服务提供商是否有效
        require(storageProviders[sellID].isValid, "Storage provider is not valid");

        // 获取存储提供商信息
        StorageProvider storage provider = storageProviders[sellID];

         // 获取购买的存储空间
         uint256 storageSpace = provider.availableSpace;

        // 计算订单总成本
        uint256 totalCost = provider.pricePerMBPerMonth * storageSpace;
        uint256 minPayment = totalCost - (totalCost / 20); // totalCost * 0.95 
        uint256 maxPayment = totalCost + (totalCost / 20); // totalCost * 1.05

         // 检查付款金额是否在允许的误差范围内
        require(msg.value >= minPayment && msg.value <= maxPayment, "Payment must be within the allowed 5% deviation range.");

        // 生成新的订单ID
        nextOrderID++;
        uint256 orderID = nextOrderID;
       
        // 创建存储验证合约
        StorageVerification verificationContract = new StorageVerification(
            provider.providerAddress,
            msg.sender,
            storageSpace,
            orderID
        );
        
        // 创建新的数据购买订单
        DataOrder storage order = dataOrders[orderID];
        order.orderID = orderID;
        order.providerAddress = provider.providerAddress;
        order.buyerAddress = msg.sender;
        order.storageSpace = storageSpace;
        order.totalCost = totalCost;
        order.stakedETH = msg.value;
        order.verificationContract = address(verificationContract);

        // 记录用户订单
        userOrders[msg.sender].push(orderID);

        // 如果设置了InstaShare合约，自动添加存储节点
        if (instaShareContract != address(0)) {
            try IInstaShare(instaShareContract).addStorageNode(
                orderID,
                provider.providerAddress,
                storageSpace
            ) {
                // 成功添加节点
            } catch {
                // 如果添加失败，不影响订单创建
            }
        }

        // 触发事件
        emit DataOrderCreated(
            orderID,
            provider.providerAddress,
            msg.sender,
            storageSpace,
            totalCost,
            msg.value,
            address(verificationContract)
        );
    }
    
    function getValidProviderSellIDs() public view returns (uint256[] memory) {
        uint256 validProviderCount = 0;
        // 计算有效的 provider 数量
        for (uint256 i = 1; i <= nextSellID; i++) {
            if (storageProviders[i].isValid) {
                validProviderCount++;
            }
        }
        // 创建数组来存储有效的 sellID
        uint256[] memory result = new uint256[](validProviderCount);
        uint256 resultIndex = 0;

        for (uint256 i = 1; i <= nextSellID; i++) {
            if (storageProviders[i].isValid) {
                result[resultIndex] = i;
                resultIndex++;
              }
          }
        return result;
    }

    function getProviderInfo(uint256 sellID) public view returns (StorageProvider memory){
        return storageProviders[sellID];
    }

    function getOrderInfo(uint256 orderID) public view returns (DataOrder memory){
        return dataOrders[orderID];
    }

    function getVerificationContractAddress(uint256 orderID) public view returns (address){
        return dataOrders[orderID].verificationContract;
    }

    function getUserOrders(address user) public view returns (uint256[] memory) {
        return userOrders[user];
    }

    function setInstaShareContract(address _instaShareContract) public onlyOwner {
        instaShareContract = _instaShareContract;
        emit InstaShareContractUpdated(_instaShareContract);
    }
}

contract StorageVerification {
    struct File {
        uint256 fileIndex;
        string fileCid;
        uint256 fileSize;
    }

    event VerificationSuccessful(string fileCid, uint256 timestamp, bytes result);
    event VerificationSuccessfulWithBlock(string fileCid, uint256 blockNumber, bytes result);

    address public providerAddress;
    address public buyerAddress;
    uint256 public storageSpace;
    uint256 public orderID;
    File[] public fileList;
    uint256 public storedSpace; // 已存储空间
    uint256 public nextFileIndex; // 文件序号

    constructor(address _providerAddress, address _buyerAddress, uint256 _storageSpace, uint256 _orderID) {
        providerAddress = _providerAddress;
        buyerAddress = _buyerAddress;
        storageSpace = _storageSpace;
        orderID = _orderID;
        storedSpace = 0;
        nextFileIndex = 1;
    }

   function invokeStorage(string memory fileCid, uint256 fileSize) public {
        require(storedSpace + fileSize <= storageSpace, "Not enough storage space");

        File memory newFile = File({
            fileIndex: nextFileIndex,
            fileCid: fileCid,
            fileSize: fileSize
        });

        fileList.push(newFile);
        storedSpace += fileSize;
        nextFileIndex++;
    }


    function verify(string memory fileCid, bytes memory input) public returns (bytes memory) {
        // 预编译合约地址(与底层源码相同)
        address customPrecompileAddress = address(0x26);
        // staticCall调用
        (bool success, bytes memory result) = customPrecompileAddress.staticcall(input);
        require(success, "PanguAdd call failed");
        
        // 触发验证成功的事件（包含时间戳）
        emit VerificationSuccessful(fileCid, block.timestamp, result);
         // 触发验证成功的事件(包含区块号)
        emit VerificationSuccessfulWithBlock(fileCid, block.number, result);

        return result;
    }
}
