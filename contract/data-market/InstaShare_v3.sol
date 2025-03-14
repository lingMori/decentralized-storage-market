// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// 导入DataMarketplace合约接口，用于验证存储订单
interface IDataMarketplace {
    function getOrderInfo(uint256 _orderID) external view returns (
        uint256 orderID,
        address providerAddress,
        address buyerAddress,
        uint256 storageSpace,
        uint256 totalCost,
        uint256 stakedETH,
        address verificationContract
    );
    
    function getVerificationContractAddress(uint256 orderID) external view returns (address);
}

contract InstaShare {
    address private _owner;
    bool private _paused;
    IDataMarketplace private _dataMarketplace;
    
    constructor(address dataMarketplaceAddress) {
        _owner = msg.sender;
        _dataMarketplace = IDataMarketplace(dataMarketplaceAddress);
    }

    struct FileInfo {
        string cid;
        uint256 size;
        uint256 timestamp;
        string fileType;
        string storageSource;
        bool isActive;
        bool exists;
    }

    struct InstanceOwner {
        address ownerAddress;
        uint256 freeLoad;         // 可用存储空间（字节）
        uint256 maxLoad;          // 最大存储空间（字节）
        bool isLocked;
        uint256 totalFiles;
        mapping(string => FileInfo) files;
        string[] fileList;
        mapping(string => uint256) fileIndexes;
        uint256[] orderIDs;       // 关联的存储订单ID列表
        mapping(uint256 => bool) orderExists; // 检查订单是否已添加
    }

    mapping(address => InstanceOwner) public instanceOwners;
    
    // Events
    event InstanceOwnerRegistered(address ownerAddress, uint256 freeLoad, bool isLocked);
    event OrderLinked(address ownerAddress, uint256 orderID, uint256 additionalSpace);
    event FreeLoadUpdated(address ownerAddress, uint256 freeLoad);
    event FileUploaded(address owner, string cid, uint256 size, string fileType, string storageSource, string fileName);
    event FileStatusUpdated(address owner, string cid, bool isActive);
    event FileRemoved(address owner, string cid);
    event InstanceLockStatusUpdated(address owner, bool isLocked);
    event MaxLoadUpdated(uint256 newMaxLoad, address ownerAddress);
    event LoadIncreased(address owner, uint256 additionalLoad);

    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error InstanceLocked();
    error InsufficientFreeLoad();
    error FileNotFound();
    error InvalidFileSize();
    error InvalidCID();
    error FileAlreadyExists();
    error LoadExceedsMaximum();
    error NotOwner();
    error ReentrantCall();
    error Paused();
    error NotPaused();
    error InvalidOrderID();
    error OrderAlreadyLinked();
    error NotOrderBuyer();

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotOwner();
        }
        _;
    }

    modifier nonReentrant() {
        if (_locked) {
            revert ReentrantCall();
        }
        _locked = true;
        _;
        _locked = false;
    }

    modifier whenNotPaused() {
        if (_paused) {
            revert Paused();
        }
        _;
    }

    modifier whenPaused() {
        if (!_paused) {
            revert NotPaused();
        }
        _;
    }

    modifier onlyRegistered() {
        if (instanceOwners[msg.sender].ownerAddress != msg.sender) {
            revert NotRegistered();
        }
        _;
    }

    modifier notLocked() {
        if (instanceOwners[msg.sender].isLocked) {
            revert InstanceLocked();
        }
        _;
    }

    // Reentrancy guard
    bool private _locked;

    // 修改后的注册功能，初始空间为零，需要链接订单才能获得存储空间
    function registerInstanceOwner() public whenNotPaused {
        if (instanceOwners[msg.sender].ownerAddress == msg.sender) {
            revert AlreadyRegistered();
        }

        InstanceOwner storage newOwner = instanceOwners[msg.sender];
        newOwner.ownerAddress = msg.sender;
        newOwner.freeLoad = 0; // 初始空间为0，需要链接订单
        newOwner.maxLoad = 0;  // 初始最大空间为0
        newOwner.isLocked = false;
        newOwner.totalFiles = 0;

        emit InstanceOwnerRegistered(msg.sender, newOwner.freeLoad, newOwner.isLocked);
    }

    // 链接存储订单以获取存储空间
    function linkStorageOrder(uint256 orderID) public whenNotPaused onlyRegistered nonReentrant {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        
        // 检查订单是否已经链接
        if (owner.orderExists[orderID]) {
            revert OrderAlreadyLinked();
        }
        
        // 从DataMarketplace获取订单信息
        (
            uint256 _orderID,
            ,  // 忽略 providerAddress
            address buyerAddress,
            uint256 storageSpace,
            ,  // 忽略 totalCost
            ,  // 忽略 stakedETH
               // 忽略 verificationContract
        ) = _dataMarketplace.getOrderInfo(orderID);
        
        // 验证订单有效性
        if (_orderID == 0) {
            revert InvalidOrderID();
        }
        
        // 验证调用者是否为订单购买者
        if (buyerAddress != msg.sender) {
            revert NotOrderBuyer();
        }
        
        // 将订单ID添加到用户的订单列表中
        owner.orderIDs.push(orderID);
        owner.orderExists[orderID] = true;
        
        // 将订单存储空间转换为字节并添加到用户的可用空间
        uint256 additionalSpaceBytes = storageSpace * 1024 * 1024; // 从MB转换为字节
        owner.freeLoad += additionalSpaceBytes;
        owner.maxLoad += additionalSpaceBytes;
        
        emit OrderLinked(msg.sender, orderID, additionalSpaceBytes);
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    // 获取用户链接的所有订单ID
    function getUserOrderIDs(address userAddress) public view returns (uint256[] memory) {
        return instanceOwners[userAddress].orderIDs;
    }

    function uploadFile(
        string calldata cid,
        uint256 fileSize,
        string calldata fileType,
        string calldata storageSource,
        string calldata fileName
    ) public whenNotPaused onlyRegistered notLocked nonReentrant {
        if (fileSize == 0 || fileSize > 100 * 1024 * 1024) {
            revert InvalidFileSize();
        }
        if (bytes(cid).length == 0) {
            revert InvalidCID();
        }
        if (instanceOwners[msg.sender].files[cid].exists) {
            revert FileAlreadyExists();
        }
        if (instanceOwners[msg.sender].freeLoad < fileSize) {
            revert InsufficientFreeLoad();
        }

        InstanceOwner storage owner = instanceOwners[msg.sender];
        
        FileInfo memory newFile = FileInfo({
            cid: cid,
            size: fileSize,
            timestamp: block.timestamp,
            fileType: fileType,
            storageSource: storageSource,
            isActive: true,
            exists: true
        });

        owner.files[cid] = newFile;
        owner.fileIndexes[cid] = owner.fileList.length;
        owner.fileList.push(cid);
        owner.totalFiles++;
        owner.freeLoad -= fileSize;

        emit FileUploaded(msg.sender, cid, fileSize, fileType, storageSource, fileName);
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function batchUploadFiles(
        string[] calldata cids,
        uint256[] calldata fileSizes,
        string[] calldata fileTypes,
        string[] calldata storageSources,
        string[] calldata fileNames
    ) public whenNotPaused onlyRegistered notLocked nonReentrant {
        uint256 totalFiles = cids.length;

        if (
            totalFiles != fileSizes.length ||
            totalFiles != fileTypes.length ||
            totalFiles != storageSources.length ||
            totalFiles != fileNames.length
        ) {
            revert("Input array lengths must match");
        }

        InstanceOwner storage owner = instanceOwners[msg.sender];

        for (uint256 i = 0; i < totalFiles; i++) {
            string memory cid = cids[i];
            uint256 fileSize = fileSizes[i];
            string memory fileType = fileTypes[i];
            string memory storageSource = storageSources[i];
            string memory fileName = fileNames[i];

            if (fileSize == 0 || fileSize > 100 * 1024 * 1024) {
                revert InvalidFileSize();
            }
            if (bytes(cid).length == 0) {
                revert InvalidCID();
            }
            if (owner.files[cid].exists) {
                revert FileAlreadyExists();
            }
            if (owner.freeLoad < fileSize) {
                revert InsufficientFreeLoad();
            }

            FileInfo memory newFile = FileInfo({
                cid: cid,
                size: fileSize,
                timestamp: block.timestamp,
                fileType: fileType,
                storageSource: storageSource,
                isActive: true,
                exists: true
            });

            owner.files[cid] = newFile;
            owner.fileIndexes[cid] = owner.fileList.length;
            owner.fileList.push(cid);
            owner.totalFiles++;
            owner.freeLoad -= fileSize;

            emit FileUploaded(msg.sender, cid, fileSize, fileType, storageSource, fileName);
        }

        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function removeFile(string calldata cid) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        FileInfo storage file = owner.files[cid];
        
        if (!file.exists) {
            revert FileNotFound();
        }

        owner.freeLoad += file.size;
        
        uint256 fileIndex = owner.fileIndexes[cid];
        uint256 lastIndex = owner.fileList.length - 1;
        
        if (fileIndex != lastIndex) {
            string memory lastCid = owner.fileList[lastIndex];
            owner.fileList[fileIndex] = lastCid;
            owner.fileIndexes[lastCid] = fileIndex;
        }
        owner.fileList.pop();
        
        delete owner.fileIndexes[cid];
        
        file.exists = false;
        file.isActive = false;
        
        owner.totalFiles--;

        emit FileRemoved(msg.sender, cid);
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function batchRemoveFiles(string[] calldata cids) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];

        for (uint256 i = 0; i < cids.length; i++) {
            string memory cid = cids[i];
            FileInfo storage file = owner.files[cid];

            if (!file.exists) {
                revert FileNotFound();
            }

            owner.freeLoad += file.size;
            
            uint256 fileIndex = owner.fileIndexes[cid];
            uint256 lastIndex = owner.fileList.length - 1;

            if (fileIndex != lastIndex) {
                string memory lastCid = owner.fileList[lastIndex];
                owner.fileList[fileIndex] = lastCid;
                owner.fileIndexes[lastCid] = fileIndex;
            }
            owner.fileList.pop();
            
            delete owner.fileIndexes[cid];
            
            file.exists = false;
            file.isActive = false;

            owner.totalFiles--;
            emit FileRemoved(msg.sender, cid);
        }

        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function updateFileStatus(string calldata cid, bool isActive) public whenNotPaused onlyRegistered {
        FileInfo storage file = instanceOwners[msg.sender].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }

        file.isActive = isActive;
        emit FileStatusUpdated(msg.sender, cid, isActive);
    }

    // 管理员可为免费用户提供少量存储空间
    function grantFreeStorage(address userAddress, uint256 storageBytes) public onlyOwner {
        InstanceOwner storage owner = instanceOwners[userAddress];
        if (owner.ownerAddress != userAddress) {
            revert NotRegistered();
        }
        
        owner.freeLoad += storageBytes;
        owner.maxLoad += storageBytes;
        
        emit FreeLoadUpdated(userAddress, owner.freeLoad);
        emit LoadIncreased(userAddress, storageBytes);
    }

    function updateMaxLoad(uint256 newMaxLoad, address ownerAddress) public onlyOwner {
        if (instanceOwners[ownerAddress].ownerAddress != ownerAddress) {
            revert NotRegistered();
        }

        uint256 usedLoad = instanceOwners[ownerAddress].maxLoad - instanceOwners[ownerAddress].freeLoad;
        
        instanceOwners[ownerAddress].freeLoad = newMaxLoad - usedLoad;
        instanceOwners[ownerAddress].maxLoad = newMaxLoad;
        emit MaxLoadUpdated(newMaxLoad, ownerAddress);
    }

    function setInstanceLock(address ownerAddress, bool locked) public onlyOwner {
        if (instanceOwners[ownerAddress].ownerAddress != ownerAddress) {
            revert NotRegistered();
        }

        instanceOwners[ownerAddress].isLocked = locked;
        emit InstanceLockStatusUpdated(ownerAddress, locked);
    }

    function batchUpdateMaxLoads(
        address[] calldata owners, 
        uint256[] calldata newMaxLoads
    ) public onlyOwner {
        require(owners.length == newMaxLoads.length, "Mismatched array lengths");
        
        for (uint256 i = 0; i < owners.length; i++) {
            updateMaxLoad(newMaxLoads[i], owners[i]);
        }
    }

    function batchSetInstanceLocks(
        address[] calldata owners, 
        bool[] calldata lockStatuses
    ) public onlyOwner {
        require(owners.length == lockStatuses.length, "Mismatched array lengths");
        
        for (uint256 i = 0; i < owners.length; i++) {
            setInstanceLock(owners[i], lockStatuses[i]);
        }
    }

    function getFileInfo(address owner, string calldata cid) public view returns (FileInfo memory) {
        FileInfo storage file = instanceOwners[owner].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }
        return file;
    }

    function getFileMetadata(address owner, string calldata cid) public view returns (
        uint256 size, 
        uint256 timestamp, 
        string memory fileType,
        string memory storageSource,
        bool isActive
    ) {
        FileInfo storage file = instanceOwners[owner].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }
        return (file.size, file.timestamp, file.fileType, file.storageSource, file.isActive);
    }

    function getFileList(address owner) public view returns (string[] memory) {
        return instanceOwners[owner].fileList;
    }

    function getUserStats(address owner) public view returns (
        uint256 totalFiles,
        uint256 freeLoad,
        uint256 maxLoad,
        bool isLocked,
        uint256 orderCount
    ) {
        InstanceOwner storage instance = instanceOwners[owner];
        return (
            instance.totalFiles,
            instance.freeLoad,
            instance.maxLoad,
            instance.isLocked,
            instance.orderIDs.length
        );
    }

    function pause() public onlyOwner whenNotPaused {
        _paused = true;
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
    }

    // 更新DataMarketplace合约地址
    function updateDataMarketplaceAddress(address newAddress) public onlyOwner {
        _dataMarketplace = IDataMarketplace(newAddress);
    }
}
