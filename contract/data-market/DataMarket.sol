// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../transaction/EthRelease.sol";
import "../transaction/EthTransfer.sol";

/**
 * @title 存储协议接口
 * @dev 定义存储协议的接口函数，用于接受和履行协议
 */
interface IStorageProtocol {
    function acceptProtocol(address provider, address customer) external returns (bool);
    function fulfillProtocol(address provider, address customer) external returns (bool);
}

/**
 * @title 数据购买协议接口
 * @dev 定义数据购买协议的接口函数，用于接受和履行协议
 */
interface IDataPurchaseProtocol {
    function acceptProtocol(address owner, address buyer) external returns (bool);
    function fulfillProtocol(address owner, address buyer) external returns (bool);
}

/**
 * @title 数据市场合约
 * @dev 该合约允许用户注册为存储提供者或数据所有者，并创建存储订单或数据订单
 */
contract DataMarketplace  {

    // using SafeETH for address payable;

    /**
     * @dev 存储提供者结构体
     * @param providerAddress 提供者地址
     * @param availableSpace 可用空间（单位：GB）
     * @param pricePerGBPerMonth 每GB每月的价格（单位：wei）
     */
    struct StorageProvider {
        address providerAddress;
        uint256 availableSpace; // in GB
        uint256 pricePerGBPerMonth; // in wei
    }

    /**
     * @dev 数据所有者结构体
     * @param ownerAddress 所有者地址
     * @param dataName 数据名称
     * @param dataPrice 数据价格（单位：wei）
     */
    struct DataOwner {
        address ownerAddress;
        string dataName; // The name of the data
        uint256 dataPrice; // in wei
    }

    /**
     * @dev 存储订单结构体
     * @param buyerAddress 买家地址
     * @param providerAddress 提供者地址
     * @param storageSpace 存储空间（单位：GB）
     * @param totalCost 总成本（单位：wei）
     * @param storageProtocol 存储协议合约地址
     * @param releaseContract EthRelease合约实例
     */
    struct StorageOrder {
        address buyerAddress;
        address providerAddress;
        uint256 storageSpace;
        uint256 totalCost;
        IStorageProtocol storageProtocol; // Storage protocol contract address
        EthRelease releaseContract; // EthRelease contract instance
    }

    /**
     * @dev 数据订单结构体
     * @param buyerAddress 买家地址
     * @param ownerAddress 所有者地址
     * @param dataName 数据名称
     * @param price 数据价格（单位：wei）
     * @param dataPurchaseProtocol 数据购买协议合约地址
     */
    struct DataOrder {
        address buyerAddress;
        address ownerAddress;
        string dataName;
        uint256 price;
        IDataPurchaseProtocol dataPurchaseProtocol; // Data purchase protocol contract address
    }

    // 从提供者地址到存储提供者的映射
    mapping(address => StorageProvider[]) public storageProviders;

    // 从数据所有者地址到数据所有者的映射
    mapping(address => DataOwner[]) public dataOwners;

    // 用于跟踪所有订单的映射
    mapping(address => StorageOrder[]) public storageOrders;
    mapping(address => DataOrder[]) public dataOrders;

    event StorageProviderRegistered(address providerAddress, uint256 availableSpace, uint256 pricePerGBPerMonth);
    event DataOwnerRegistered(address ownerAddress, string dataName, uint256 dataPrice);

    event StorageOrderCreated(address buyerAddress, address providerAddress, uint256 storageSpace, uint256 totalCost, address protocol, address releaseContract);
    event DataOrderCreated(address buyerAddress, address ownerAddress, string dataName, uint256 price, address protocol);

    /**
     * @dev 注册存储提供者
     * @param availableSpace 提供的可用空间（单位：GB）
     * @param pricePerGBPerMonth 每GB每月的价格（单位：wei）
     */
    function registerStorageProvider(uint256 availableSpace, uint256 pricePerGBPerMonth) public {
        // StorageProvider storage provider = storageProviders[msg.sender];

        StorageProvider memory provider = StorageProvider({
            providerAddress:msg.sender,
            availableSpace:availableSpace,
            pricePerGBPerMonth:pricePerGBPerMonth
        });

        storageProviders[msg.sender].push(provider);

        emit StorageProviderRegistered(msg.sender, availableSpace, pricePerGBPerMonth);
    }

    /**
     * @dev 注册数据所有者
     * @param dataName 数据名称
     * @param dataPrice 数据价格（单位：wei）
     */
    function registerDataOwner(string memory dataName, uint256 dataPrice) public {
        DataOwner memory owner = DataOwner({
            ownerAddress:msg.sender,
            dataName:dataName,
            dataPrice:dataPrice
        });
        dataOwners[msg.sender].push(owner);

        emit DataOwnerRegistered(msg.sender, dataName, dataPrice);
    }

    /**
     * @dev 创建存储订单
     * @param providerAddress 存储提供者地址
     * @param storageSpace 订购的存储空间（单位：GB）
     * @param storageProtocol 存储协议合约地址
     * @param releaseDuration 释放周期（单位：秒）
     */
    function createStorageOrder(address providerAddress, uint256 storageIndex, uint256 storageSpace, IStorageProtocol storageProtocol, uint256 releaseDuration) public payable {
        // Check that the provider exists and has enough space
        StorageProvider storage provider = storageProviders[providerAddress][storageIndex];
        require(provider.availableSpace >= storageSpace, "Not enough available space");

        // Calculate total cost and check that the buyer has paid enough
        uint256 totalCost = storageSpace * provider.pricePerGBPerMonth;
        require(msg.value >= totalCost, "Not enough ether sent for transaction");

        // Deploy a new EthRelease contract
        EthRelease releaseContract = new EthRelease{value: msg.value}(providerAddress, releaseDuration);

        // Update provider's available space
        provider.availableSpace -= storageSpace;

        // Create and store the order
        // StorageOrder storage order = storageOrders[msg.sender];
        StorageOrder memory order = StorageOrder({
            buyerAddress:msg.sender,
            providerAddress:providerAddress,
            storageSpace:storageSpace,
            totalCost:totalCost,
            storageProtocol:storageProtocol,
            releaseContract:releaseContract
        });
        storageOrders[msg.sender].push(order);

        emit StorageOrderCreated(msg.sender, providerAddress, storageSpace, totalCost, address(storageProtocol), address(releaseContract));
    }

    /**
     * @dev 创建数据订单
     * @param ownerAddress 数据所有者地址
     * @param dataPurchaseProtocol 数据购买协议合约地址
     */
    function createDataOrder(address payable ownerAddress, uint256 dataIndex, IDataPurchaseProtocol dataPurchaseProtocol) public payable {
        // Check that the owner exists and that the buyer has paid enough
        // Check that the owner exists and that the buyer has paid enough
        require(dataIndex < dataOwners[ownerAddress].length, "Invalid data index");

        DataOwner storage owner = dataOwners[ownerAddress][dataIndex];
        require(msg.value >= owner.dataPrice, "Not enough ether sent for transaction");

        // transfer to data owner (once only)
        // ownerAddress.safeTransfer(msg.value);
        SafeETH.safeTransfer(ownerAddress, msg.value);

        // Create and store the order
        DataOrder memory order = DataOrder({
            buyerAddress:msg.sender,
            ownerAddress:ownerAddress,
            dataName:owner.dataName,
            price:owner.dataPrice,
            dataPurchaseProtocol:dataPurchaseProtocol
        });

        dataOrders[msg.sender].push(order);

        emit DataOrderCreated(msg.sender, ownerAddress, owner.dataName, owner.dataPrice, address(dataPurchaseProtocol));
    }

    /**
     * @dev 释放资金
     * @param buyerAddress 买家地址
     */
    function releaseFunds(address buyerAddress, uint256 orderIndex) public {
        StorageOrder storage order = storageOrders[buyerAddress][orderIndex];
        require(order.buyerAddress != address(0), "No storage order found for this buyer");

        order.releaseContract.release();
    }

    // ... more functions to handle transactions, etc.
}
