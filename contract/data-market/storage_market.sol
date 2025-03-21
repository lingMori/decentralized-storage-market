// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DataMarketplace {
    // --- 数据结构 ---
    struct StorageProvider {
        uint256 sellID; // 卖单ID
        address providerAddress; // 提供商的以太坊地址
        uint256 availableSpace; // 可用存储空间 (MB)
        uint256 pricePerMBPerMonth; // 每MB每月的价格 (wei)
        uint256 stakedETH; // 质押的 ETH (wei)
    }

    struct DataOrder {
        uint256 orderID;  // 订单ID
        address providerAddress; // 存储服务提供商地址
        address buyerAddress;  // 服务购买者地址
        uint256 storageSpace;  // 购买的存储空间 (MB)
        uint256 totalCost;  // 订单总成本 (wei)
        uint256 stakedETH; // 购买时质押的 ETH (wei)
    }

    // --- 状态变量 ---
    mapping(uint256 => StorageProvider) public storageProviders; // 使用卖单ID映射到存储卖单信息
    mapping(uint256 => DataOrder) public dataOrders; // 使用订单ID映射到数据订单信息
    uint256 public nextSellID; // 用于生成唯一的卖单ID
    uint256 public nextOrderID; // 用于生成唯一的订单ID

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
        uint256 stakedETH 
    );


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

          // 触发事件
        emit StorageProviderRegistered(sellID, msg.sender, availableSpace, pricePerMBPerMonth, msg.value);
    }


    function createDataOrder(uint256 sellID, uint256 storageSpace) public payable {
        // 验证存储服务提供商是否存在
        require(storageProviders[sellID].providerAddress != address(0), "Storage provider not found");

        // 获取存储提供商信息
        StorageProvider storage provider = storageProviders[sellID];

        // 计算订单总成本
        uint256 totalCost = provider.pricePerMBPerMonth * storageSpace;
        uint256 minPayment = totalCost - (totalCost / 20); // totalCost * 0.95 
        uint256 maxPayment = totalCost + (totalCost / 20); // totalCost * 1.05

         // 检查付款金额是否在允许的误差范围内
        require(msg.value >= minPayment && msg.value <= maxPayment, "Payment must be within the allowed 5% deviation range.");

        // 生成新的订单ID
        nextOrderID++;
        uint256 orderID = nextOrderID;

        // 创建新的数据购买订单
        DataOrder storage order = dataOrders[orderID];
        order.orderID = orderID;
        order.providerAddress = provider.providerAddress;
        order.buyerAddress = msg.sender;
        order.storageSpace = storageSpace;
        order.totalCost = totalCost;
        order.stakedETH = msg.value;

        // todo 将金额转入到存储验证合约

        // 触发事件
        emit DataOrderCreated(
            orderID,
            provider.providerAddress,
            msg.sender,
            storageSpace,
            totalCost,
            msg.value
        );
    }

    function getProviderInfo(uint256 sellID) public view returns (StorageProvider memory){
        return storageProviders[sellID];
    }

    function getOrderInfo(uint256 orderID) public view returns (DataOrder memory){
        return dataOrders[orderID];
    }
}