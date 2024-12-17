// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract InstaShare is Ownable, ReentrancyGuard, Pausable {
    constructor(address initialOwner) Ownable(initialOwner) {}

    struct FileInfo {
        string cid;
        uint256 size;
        uint256 timestamp;
        string fileType;
        bool isActive;
        bool exists;
    }

    struct InstanceOwner {
        address ownerAddress;
        address storageSource;
        uint256 freeLoad;
        uint256 maxLoad;
        bool isLocked;
        uint256 totalFiles;
        mapping(string => FileInfo) files;
        string[] fileList;
        mapping(string => uint256) fileIndexes;
    }

    mapping(address => InstanceOwner) public instanceOwners;
    
    // Events
    event InstanceOwnerRegistered(address ownerAddress, address storageSource, uint256 freeLoad, bool isLocked);
    event FreeLoadUpdated(address ownerAddress, uint256 freeLoad);
    event FileUploaded(address owner, string cid, uint256 size, string fileType, string fileName);
    event FileStatusUpdated(address owner, string cid, bool isActive);
    event FileRemoved(address owner, string cid);
    event InstanceLockStatusUpdated(address owner, bool isLocked);
    event MaxLoadUpdated(uint256 newMaxLoad, address ownerAddress);
    event LoadIncreased(address owner, uint256 additionalLoad);

    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error NotStorageSourcer();
    error InstanceLocked();
    error InsufficientFreeLoad();
    error FileNotFound();
    error InvalidFileSize();
    error InvalidCID();
    error FileAlreadyExists();
    error LoadExceedsMaximum();

    // Modifiers
    modifier onlyRegistered() {
        if (instanceOwners[msg.sender].ownerAddress != msg.sender) {
            revert NotRegistered();
        }
        _;
    }

    modifier  onlyStorageSourcer() {
        if (instanceOwners[msg.sender].storageSource != msg.sender) {
            revert NotStorageSourcer();
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
        newOwner.storageSource = msg.sender;
        newOwner.freeLoad = 128 * 1024 * 1024; // 128MB in bytes
        newOwner.maxLoad = 128 * 1024 * 1024; // 128MB in bytes
        newOwner.isLocked = false;
        newOwner.totalFiles = 0;

        emit InstanceOwnerRegistered(msg.sender, newOwner.storageSource, newOwner.freeLoad, newOwner.isLocked);
    }

    function uploadFile(
        string calldata cid,
        uint256 fileSize,
        string calldata fileType,
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
            isActive: true,
            exists: true
        });

        owner.files[cid] = newFile;
        owner.fileIndexes[cid] = owner.fileList.length;
        owner.fileList.push(cid);
        owner.totalFiles++;
        owner.freeLoad -= fileSize;

        emit FileUploaded(msg.sender, cid, fileSize, fileType, fileName);
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function batchUploadFiles(
        string[] calldata cids,
        uint256[] calldata fileSizes,
        string[] calldata fileTypes,
        string[] calldata fileNames
    ) public whenNotPaused onlyRegistered notLocked nonReentrant {
        uint256 totalFiles = cids.length;

        if (
            totalFiles != fileSizes.length ||
            totalFiles != fileTypes.length ||
            totalFiles != fileNames.length
        ) {
            revert("Input array lengths must match");
        }

        InstanceOwner storage owner = instanceOwners[msg.sender];

        for (uint256 i = 0; i < totalFiles; i++) {
            string memory cid = cids[i];
            uint256 fileSize = fileSizes[i];
            string memory fileType = fileTypes[i];
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
                isActive: true,
                exists: true
            });

            owner.files[cid] = newFile;
            owner.fileIndexes[cid] = owner.fileList.length;
            owner.fileList.push(cid);
            owner.totalFiles++;
            owner.freeLoad -= fileSize;

            emit FileUploaded(msg.sender, cid, fileSize, fileType, fileName);
        }

        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function removeFile(string calldata cid) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        FileInfo storage file = owner.files[cid];
        
        if (!file.exists) {
            revert FileNotFound();
        }

        // 返还存储空间
        owner.freeLoad += file.size;
        
        // 从fileList数组中移除
        uint256 fileIndex = owner.fileIndexes[cid];
        uint256 lastIndex = owner.fileList.length - 1;
        
        if (fileIndex != lastIndex) {
            string memory lastCid = owner.fileList[lastIndex];
            owner.fileList[fileIndex] = lastCid;
            owner.fileIndexes[lastCid] = fileIndex;
        }
        owner.fileList.pop();
        
        // 清除索引映射
        delete owner.fileIndexes[cid];
        
        // 标记文件为不存在，而不是完全删除
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

            // 返还存储空间
            owner.freeLoad += file.size;
            
            // 从fileList数组中移除
            uint256 fileIndex = owner.fileIndexes[cid];
            uint256 lastIndex = owner.fileList.length - 1;

            if (fileIndex != lastIndex) {
                string memory lastCid = owner.fileList[lastIndex];
                owner.fileList[fileIndex] = lastCid;
                owner.fileIndexes[lastCid] = fileIndex;
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

    // New functions for load management and querying
    function increaseFreeLoad(uint256 additionalLoad) public onlyRegistered {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        if (owner.freeLoad + additionalLoad > owner.maxLoad) {
            revert LoadExceedsMaximum();
        }
        owner.freeLoad += additionalLoad;
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
        emit LoadIncreased(msg.sender, additionalLoad);
    }

    // Admin functions
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

    // Batch admin operations
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

    // Metadata and stats functions
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
        bool isActive
    ) {
        FileInfo storage file = instanceOwners[owner].files[cid];
        if (!file.exists) {
            revert FileNotFound();
        }
        return (file.size, file.timestamp, file.fileType, file.isActive);
    }

    function getFileList(address owner) public view returns (string[] memory) {
        return instanceOwners[owner].fileList;
    }

    function getUserStats(address owner) public view returns (
        uint256 totalFiles,
        uint256 freeLoad,
        uint256 maxLoad,
        bool isLocked
    ) {
        InstanceOwner storage instance = instanceOwners[owner];
        return (
            instance.totalFiles,
            instance.freeLoad,
            instance.maxLoad,
            instance.isLocked
        );
    }

    // Emergency functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
