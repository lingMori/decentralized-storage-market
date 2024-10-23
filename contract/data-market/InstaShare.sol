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
        bool exists;  // 新增标记位
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
    }

    mapping(address => InstanceOwner) public instanceOwners;
    
    // Events
    event InstanceOwnerRegistered(address ownerAddress, uint256 freeLoad, bool isLocked);
    event FreeLoadUpdated(address ownerAddress, uint256 freeLoad);
    event FileUploaded(address owner, string cid, uint256 size, string fileType, string fileName);
    event FileStatusUpdated(address owner, string cid, bool isActive);
    event FileRemoved(address owner, string cid);
    event InstanceLockStatusUpdated(address owner, bool isLocked);

    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error InstanceLocked();
    error InsufficientFreeLoad();
    error FileNotFound();
    error InvalidFileSize();
    error InvalidCID();
    error FileAlreadyExists();

    // Modifiers
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
        string calldata fileName
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
            exists: true  // 设置exists标记
        });

        owner.files[cid] = newFile;
        owner.fileIndexes[cid] = owner.fileList.length; // 记录索引
        owner.fileList.push(cid);
        owner.totalFiles++;
        owner.freeLoad -= fileSize;

        emit FileUploaded(msg.sender, cid, fileSize, fileType, fileName);
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
    }

    function removeFile(string calldata cid) public whenNotPaused onlyRegistered notLocked {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        FileInfo storage file = owner.files[cid];
        
        if (!file.exists) { // 修改：使用exists检查
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
    function updateFreeLoad(uint256 newFreeload, address ownerAddress) public onlyOwner {
        if (instanceOwners[ownerAddress].ownerAddress != ownerAddress) {
            revert NotRegistered();
        }

        uint256 usedLoad = instanceOwners[ownerAddress].maxLoad - instanceOwners[ownerAddress].freeLoad;
        
        instanceOwners[ownerAddress].freeLoad = newFreeload - usedLoad;
        instanceOwners[ownerAddress].maxLoad = newFreeload;
        emit FreeLoadUpdated(ownerAddress, newFreeload);
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

    // Emergency functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}