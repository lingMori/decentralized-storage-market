// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract InstaShare {
    address private _owner;
    bool private _paused;
    bool private _locked; // Reentrancy guard
    
    constructor() {
        _owner = msg.sender;
        _paused = false;
        _locked = false;
    }

    struct FileInfo {
        string cid;
        uint256 size;
        uint256 timestamp;
        string fileType;
        bool isActive;
        bool exists;  // 新增标记位
        uint256 storageNodeId; // 新增：文件所在的存储节点ID
    }

    struct StorageNode {
        uint256 nodeId; // 节点ID（对应storageMarket的orderID）
        address providerAddress; // 存储提供商地址
        uint256 totalSpace; // 节点总空间
        uint256 usedSpace; // 已使用空间
        uint256 availableSpace; // 可用空间
        bool isActive; // 节点是否激活
        uint256 purchaseTime; // 购买时间
    }

    struct InstanceOwner {
        address ownerAddress;
        uint256 freeLoad;
        uint256 maxLoad;
        bool isLocked;
        uint256 totalFiles;
        mapping(string => FileInfo) files;
        string[] fileList;
        mapping(string => uint256) fileIndexes; // 新增：记录文件在数组中的索引
        mapping(uint256 => StorageNode) storageNodes; // 新增：用户的存储节点映射
        uint256[] nodeList; // 新增：用户的节点列表
        uint256 totalNodes; // 新增：用户拥有的节点总数
    }

    mapping(address => InstanceOwner) public instanceOwners;
    
    // Events
    event InstanceOwnerRegistered(address ownerAddress, uint256 freeLoad, bool isLocked);
    event FreeLoadUpdated(address ownerAddress, uint256 freeLoad);
    event FileUploaded(address owner, string cid, uint256 size, string fileType, string fileName, uint256 storageNodeId);
    event FileStatusUpdated(address owner, string cid, bool isActive);
    event FileRemoved(address owner, string cid);
    event InstanceLockStatusUpdated(address owner, bool isLocked);
    event MaxLoadUpdated(uint256 newMaxLoad, address ownerAddress);
    event StorageNodeAdded(address owner, uint256 nodeId, address providerAddress, uint256 totalSpace);
    event StorageNodeUpdated(address owner, uint256 nodeId, uint256 usedSpace, uint256 availableSpace);
    event StorageNodeDeactivated(address owner, uint256 nodeId);

    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error InstanceLocked();
    error InsufficientFreeLoad();
    error FileNotFound();
    error InvalidFileSize();
    error InvalidCID();
    error FileAlreadyExists();
    error StorageNodeNotFound();
    error InsufficientNodeSpace();
    error StorageNodeInactive();
    error StorageNodeAlreadyExists();
    error NotOwner();
    error ReentrantCall();
    error Paused();
    error NotPaused();

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

    function registerInstanceOwner() public whenNotPaused {
        if (instanceOwners[msg.sender].ownerAddress == msg.sender) {
            revert AlreadyRegistered();
        }

        InstanceOwner storage newOwner = instanceOwners[msg.sender];
        newOwner.ownerAddress = msg.sender;
        newOwner.freeLoad = 128 * 1024 * 1024; // 128MB in bytes
        newOwner.maxLoad = 128 * 1024 * 1024; // 100MB in bytes
        newOwner.isLocked = false;
        newOwner.totalFiles = 0;

        emit InstanceOwnerRegistered(msg.sender, newOwner.freeLoad, newOwner.isLocked);
    }

    function uploadFile(
        string calldata cid,
        uint256 fileSize,
        string calldata fileType,
        string calldata fileName,
        uint256 storageNodeId
    ) public whenNotPaused onlyRegistered notLocked nonReentrant {
        if (fileSize == 0 || fileSize > 100 * 1024 * 1024) {
            revert InvalidFileSize();
        }
        if (bytes(cid).length == 0) {
            revert InvalidCID();
        }
        if (instanceOwners[msg.sender].files[cid].exists) { // 修改：使用exists检查
            revert FileAlreadyExists();
        }

        InstanceOwner storage owner = instanceOwners[msg.sender];
        
        // 检查存储节点
        StorageNode storage node = owner.storageNodes[storageNodeId];
        if (node.nodeId == 0) {
            revert StorageNodeNotFound();
        }
        if (!node.isActive) {
            revert StorageNodeInactive();
        }
        if (node.availableSpace < fileSize) {
            revert InsufficientNodeSpace();
        }

        // 如果使用默认存储（nodeId = 0），检查freeLoad
        if (storageNodeId == 0) {
            if (owner.freeLoad < fileSize) {
                revert InsufficientFreeLoad();
            }
            owner.freeLoad -= fileSize;
        } else {
            // 使用购买的节点存储
            node.usedSpace += fileSize;
            node.availableSpace -= fileSize;
            emit StorageNodeUpdated(msg.sender, storageNodeId, node.usedSpace, node.availableSpace);
        }
        
        FileInfo memory newFile = FileInfo({
            cid: cid,
            size: fileSize,
            timestamp: block.timestamp,
            fileType: fileType,
            isActive: true,
            exists: true,  // 设置exists标记
            storageNodeId: storageNodeId
        });

        owner.files[cid] = newFile;
        owner.fileIndexes[cid] = owner.fileList.length; // 记录索引
        owner.fileList.push(cid);
        owner.totalFiles++;

        emit FileUploaded(msg.sender, cid, fileSize, fileType, fileName, storageNodeId);
        if (storageNodeId == 0) {
            emit FreeLoadUpdated(msg.sender, owner.freeLoad);
        }
    }

    function batchUploadFiles(
        string[] calldata cids,
        uint256[] calldata fileSizes,
        string[] calldata fileTypes,
        string[] calldata fileNames,
        uint256[] calldata storageNodeIds
    ) public whenNotPaused onlyRegistered notLocked nonReentrant {
        uint256 totalFiles = cids.length;

        if (
            totalFiles != fileSizes.length ||
            totalFiles != fileTypes.length ||
            totalFiles != fileNames.length ||
            totalFiles != storageNodeIds.length
        ) {
            revert("Input array lengths must match");
        }

        InstanceOwner storage owner = instanceOwners[msg.sender];

        for (uint256 i = 0; i < totalFiles; i++) {
            string memory cid = cids[i];
            uint256 fileSize = fileSizes[i];
            string memory fileType = fileTypes[i];
            string memory fileName = fileNames[i];
            uint256 storageNodeId = storageNodeIds[i];

            if (fileSize == 0 || fileSize > 100 * 1024 * 1024) {
                revert InvalidFileSize();
            }
            if (bytes(cid).length == 0) {
                revert InvalidCID();
            }
            if (owner.files[cid].exists) { // 修改：使用exists检查
                revert FileAlreadyExists();
            }

            // 检查存储节点
            StorageNode storage node = owner.storageNodes[storageNodeId];
            if (node.nodeId == 0 && storageNodeId != 0) {
                revert StorageNodeNotFound();
            }
            if (storageNodeId != 0 && !node.isActive) {
                revert StorageNodeInactive();
            }
            if (storageNodeId != 0 && node.availableSpace < fileSize) {
                revert InsufficientNodeSpace();
            }

            // 更新存储空间
            if (storageNodeId == 0) {
                if (owner.freeLoad < fileSize) {
                    revert InsufficientFreeLoad();
                }
                owner.freeLoad -= fileSize;
            } else {
                node.usedSpace += fileSize;
                node.availableSpace -= fileSize;
                emit StorageNodeUpdated(msg.sender, storageNodeId, node.usedSpace, node.availableSpace);
            }

            FileInfo memory newFile = FileInfo({
                cid: cid,
                size: fileSize,
                timestamp: block.timestamp,
                fileType: fileType,
                isActive: true,
                exists: true,  // 设置exists标记
                storageNodeId: storageNodeId
            });

            owner.files[cid] = newFile;
            owner.fileIndexes[cid] = owner.fileList.length; // 记录索引
            owner.fileList.push(cid);
            owner.totalFiles++;

            emit FileUploaded(msg.sender, cid, fileSize, fileType, fileName, storageNodeId);
        }

        if (storageNodeIds.length > 0 && storageNodeIds[0] == 0) {
            emit FreeLoadUpdated(msg.sender, owner.freeLoad);
        }
    }


    function removeFile(string calldata cid) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        FileInfo storage file = owner.files[cid];
        
        if (!file.exists) { // 修改：使用exists检查
            revert FileNotFound();
        }

        // 返还存储空间
        uint256 storageNodeId = file.storageNodeId;
        if (storageNodeId == 0) {
            owner.freeLoad += file.size;
            emit FreeLoadUpdated(msg.sender, owner.freeLoad);
        } else {
            StorageNode storage node = owner.storageNodes[storageNodeId];
            node.usedSpace -= file.size;
            node.availableSpace += file.size;
            emit StorageNodeUpdated(msg.sender, storageNodeId, node.usedSpace, node.availableSpace);
        }
        
        // 从fileList数组中移除
        uint256 fileIndex = owner.fileIndexes[cid];
        uint256 lastIndex = owner.fileList.length - 1;
        
        if (fileIndex != lastIndex) {
            string memory lastCid = owner.fileList[lastIndex];
            owner.fileList[fileIndex] = lastCid;
            owner.fileIndexes[lastCid] = fileIndex; // 更新被移动文件的索引
        }
        owner.fileList.pop();
        
        // 清除索引映射
        delete owner.fileIndexes[cid];
        
        // 标记文件为不存在，而不是完全删除
        file.exists = false;
        file.isActive = false;
        
        owner.totalFiles--;

        emit FileRemoved(msg.sender, cid);
    }

    function batchRemoveFiles(string[] calldata cids) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];

        for (uint256 i = 0; i < cids.length; i++) {
            string memory cid = cids[i];
            FileInfo storage file = owner.files[cid];

            if (!file.exists) {
                revert FileNotFound();
            }

            // 返还存储空间
            uint256 storageNodeId = file.storageNodeId;
            if (storageNodeId == 0) {
                owner.freeLoad += file.size;
            } else {
                StorageNode storage node = owner.storageNodes[storageNodeId];
                node.usedSpace -= file.size;
                node.availableSpace += file.size;
                emit StorageNodeUpdated(msg.sender, storageNodeId, node.usedSpace, node.availableSpace);
            }
            
            // 从fileList数组中移除
            uint256 fileIndex = owner.fileIndexes[cid];
            uint256 lastIndex = owner.fileList.length - 1;

            if (fileIndex != lastIndex) {
                string memory lastCid = owner.fileList[lastIndex];
                owner.fileList[fileIndex] = lastCid;
                owner.fileIndexes[lastCid] = fileIndex; // 更新被移动文件的索引
            }
            owner.fileList.pop();
            
            // 清除索引映射
            delete owner.fileIndexes[cid];
            
            // 标记文件为不存在，而不是完全删除
            file.exists = false;
            file.isActive = false;

            owner.totalFiles--;
            emit FileRemoved(msg.sender, cid);
        }

        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }


    function updateFileStatus(string calldata cid, bool isActive) public whenNotPaused onlyRegistered {
        FileInfo storage file = instanceOwners[msg.sender].files[cid];
        if (file.size == 0) {
            revert FileNotFound();
        }

        file.isActive = isActive;
        emit FileStatusUpdated(msg.sender, cid, isActive);
    }

    // Admin functions
    function updateMaxLoad(uint256 newMaxLoad, address ownerAddress) public onlyOwner {
        if (instanceOwners[ownerAddress].ownerAddress != ownerAddress) {
            revert NotRegistered();
        }

        uint256 usedLoad = instanceOwners[ownerAddress].maxLoad - instanceOwners[ownerAddress].freeLoad;
        
        instanceOwners[ownerAddress].freeLoad = newMaxLoad - usedLoad;
        instanceOwners[ownerAddress].maxLoad = newMaxLoad;
        // emit FreeLoadUpdated(ownerAddress, newMaxLoad);
        // add maxload update event
        emit MaxLoadUpdated(newMaxLoad, ownerAddress);
    }

    function setInstanceLock(address ownerAddress, bool locked) public onlyOwner {
        if (instanceOwners[ownerAddress].ownerAddress != ownerAddress) {
            revert NotRegistered();
        }

        instanceOwners[ownerAddress].isLocked = locked;
        emit InstanceLockStatusUpdated(ownerAddress, locked);
    }

    // 修改检查文件是否存在的方法
    function getFileInfo(address owner, string calldata cid) public view returns (FileInfo memory) {
        FileInfo storage file = instanceOwners[owner].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }
        return file;
    }

    function getFileList(address owner) public view returns (string[] memory) {
        return instanceOwners[owner].fileList;
    }

    function getUserStats(address owner) public view returns (
        uint256 totalFiles,
        uint256 freeLoad,
        bool isLocked
    ) {
        InstanceOwner storage instance = instanceOwners[owner];
        return (
            instance.totalFiles,
            instance.freeLoad,
            instance.isLocked
        );
    }

    // Storage Node Management Functions
    function addStorageNode(
        uint256 nodeId,
        address providerAddress,
        uint256 totalSpace
    ) public whenNotPaused onlyRegistered {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        
        if (owner.storageNodes[nodeId].nodeId != 0) {
            revert StorageNodeAlreadyExists();
        }

        StorageNode memory newNode = StorageNode({
            nodeId: nodeId,
            providerAddress: providerAddress,
            totalSpace: totalSpace,
            usedSpace: 0,
            availableSpace: totalSpace,
            isActive: true,
            purchaseTime: block.timestamp
        });

        owner.storageNodes[nodeId] = newNode;
        owner.nodeList.push(nodeId);
        owner.totalNodes++;

        emit StorageNodeAdded(msg.sender, nodeId, providerAddress, totalSpace);
    }

    function deactivateStorageNode(uint256 nodeId) public whenNotPaused onlyRegistered {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        StorageNode storage node = owner.storageNodes[nodeId];
        
        if (node.nodeId == 0) {
            revert StorageNodeNotFound();
        }

        node.isActive = false;
        emit StorageNodeDeactivated(msg.sender, nodeId);
    }

    function getStorageNode(address ownerAddress, uint256 nodeId) public view returns (StorageNode memory) {
        StorageNode storage node = instanceOwners[ownerAddress].storageNodes[nodeId];
        if (node.nodeId == 0) {
            revert StorageNodeNotFound();
        }
        return node;
    }

    function getUserStorageNodes(address ownerAddress) public view returns (uint256[] memory) {
        return instanceOwners[ownerAddress].nodeList;
    }

    function getFileStorageNode(address owner, string calldata cid) public view returns (uint256) {
        FileInfo storage file = instanceOwners[owner].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }
        return file.storageNodeId;
    }

    function getNodeStats(address ownerAddress, uint256 nodeId) public view returns (
        uint256 totalSpace,
        uint256 usedSpace,
        uint256 availableSpace,
        bool isActive,
        address providerAddress
    ) {
        StorageNode storage node = instanceOwners[ownerAddress].storageNodes[nodeId];
        if (node.nodeId == 0) {
            revert StorageNodeNotFound();
        }
        return (
            node.totalSpace,
            node.usedSpace,
            node.availableSpace,
            node.isActive,
            node.providerAddress
        );
    }

    // Emergency functions
    function pause() public onlyOwner whenNotPaused {
        _paused = true;
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
    }

    // View functions
    function owner() public view returns (address) {
        return _owner;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        _owner = newOwner;
    }
}
