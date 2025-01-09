// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract InstaShare {
    address private _owner;
    bool private _paused;
    
    constructor() {
        _owner = msg.sender;
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
    event InstanceOwnerRegistered(address ownerAddress, uint256 freeLoad, bool isLocked);
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

    function registerInstanceOwner() public whenNotPaused {
        if (instanceOwners[msg.sender].ownerAddress == msg.sender) {
            revert AlreadyRegistered();
        }

        InstanceOwner storage newOwner = instanceOwners[msg.sender];
        newOwner.ownerAddress = msg.sender;
        newOwner.freeLoad = 128 * 1024 * 1024; // 128MB in bytes
        newOwner.maxLoad = 128 * 1024 * 1024; // 128MB in bytes
        newOwner.isLocked = false;
        newOwner.totalFiles = 0;

        emit InstanceOwnerRegistered(msg.sender, newOwner.freeLoad, newOwner.isLocked);
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
        if (file.size == 0) {
            revert FileNotFound();
        }

        file.isActive = isActive;
        emit FileStatusUpdated(msg.sender, cid, isActive);
    }

    function increaseFreeLoad(uint256 additionalLoad) public onlyRegistered {
        InstanceOwner storage owner = instanceOwners[msg.sender];
        if (owner.freeLoad + additionalLoad > owner.maxLoad) {
            revert LoadExceedsMaximum();
        }
        owner.freeLoad += additionalLoad;
        emit FreeLoadUpdated(msg.sender, owner.freeLoad);
        emit LoadIncreased(msg.sender, additionalLoad);
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

    function pause() public onlyOwner whenNotPaused {
        _paused = true;
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
    }
}
