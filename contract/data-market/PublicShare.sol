// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPFSPublicStorage
 * @dev 基于IPFS的公开存储合约，支持单文件和批量文件存储、查询和管理
 */
contract IPFSPublicStorage is Ownable, ReentrancyGuard {
    // 文件记录结构
    struct FileRecord {
        address uploader;    // 上传者地址
        string fileHash;     // 文件在IPFS的哈希
        uint256 timestamp;   // 上传时间戳
        
        // 文件基本属性
        string fileName;     // 文件名
        string fileType;     // 文件类型/扩展名
        uint256 fileSize;    // 文件大小（字节）
        
        bool isActive;       // 记录是否有效
    }

    // 事件定义
    event FileStored(
        address indexed uploader, 
        string indexed fileHash, 
        uint256 timestamp
    );
    
    event BatchFilesStored(
        address indexed uploader, 
        uint256 fileCount,
        uint256 timestamp
    );
    
    event FileUpdated(
        string indexed oldHash, 
        string indexed newHash
    );
    
    event FileInvalidated(
        string indexed fileHash
    );

    // 存储映射
    mapping(string => FileRecord) public fileRecords;
    mapping(address => string[]) public userUploads;
    
    // 总记录数
    uint256 public totalRecords;

    // 批量上传限制
    uint256 public constant MAX_BATCH_SIZE = 50;

    constructor(address initialOwner) Ownable(initialOwner) {}

    // 单文件存储函数（保留原有功能）
    function storeFile(
        string memory _fileHash, 
        string memory _fileName,
        string memory _fileType,
        uint256 _fileSize
    ) public nonReentrant {
        _storeFileInternal(
            _fileHash, 
            _fileName, 
            _fileType, 
            _fileSize, 
            msg.sender
        );
    }

    // 批量上传文件
    function batchStoreFiles(
        string[] memory _fileHashes,
        string[] memory _fileNames,
        string[] memory _fileTypes,
        uint256[] memory _fileSizes
    ) public nonReentrant {
        // 验证批量上传参数
        require(
            _fileHashes.length > 0 && 
            _fileHashes.length <= MAX_BATCH_SIZE,
            "Invalid batch size"
        );
        require(
            _fileHashes.length == _fileNames.length &&
            _fileHashes.length == _fileTypes.length &&
            _fileHashes.length == _fileSizes.length,
            "Mismatched input arrays"
        );

        // 批量存储文件
        uint256 successCount = 0;
        for (uint256 i = 0; i < _fileHashes.length; i++) {
            try this.storeFile(
                _fileHashes[i], 
                _fileNames[i], 
                _fileTypes[i], 
                _fileSizes[i]
            ) {
                successCount++;
            } catch {
                // 忽略已存在的文件，继续处理其他文件
                continue;
            }
        }

        // 触发批量存储事件
        emit BatchFilesStored(msg.sender, successCount, block.timestamp);
    }

    // 内部文件存储逻辑
    function _storeFileInternal(
        string memory _fileHash, 
        string memory _fileName,
        string memory _fileType,
        uint256 _fileSize,
        address _uploader
    ) internal {
        // 检查文件哈希是否已存在
        require(
            bytes(fileRecords[_fileHash].fileHash).length == 0, 
            "File hash already exists"
        );

        // 创建新的存储记录
        FileRecord memory newRecord = FileRecord({
            uploader: _uploader,
            fileHash: _fileHash,
            timestamp: block.timestamp,
            fileName: _fileName,
            fileType: _fileType,
            fileSize: _fileSize,
            isActive: true
        });

        // 存储记录
        fileRecords[_fileHash] = newRecord;
        userUploads[_uploader].push(_fileHash);
        totalRecords++;

        // 触发事件
        emit FileStored(_uploader, _fileHash, block.timestamp);
    }

    // 其他函数保持不变（getFile, getUserUploads等）
    function getFile(
        string memory _fileHash
    ) public view returns (FileRecord memory) {
        require(
            fileRecords[_fileHash].isActive, 
            "File record not found or invalidated"
        );
        return fileRecords[_fileHash];
    }

    // 获取用户上传的所有文件
    function getUserUploads(
        address _user
    ) public view returns (string[] memory) {
        return userUploads[_user];
    }

    // 管理员作废文件记录
    function invalidateFile(
        string memory _fileHash
    ) public onlyOwner {
        require(
            fileRecords[_fileHash].isActive, 
            "File already invalidated"
        );
        
        fileRecords[_fileHash].isActive = false;
        
        emit FileInvalidated(_fileHash);
    }

    // 批量作废文件
    function batchInvalidateFiles(
        string[] memory _fileHashes
    ) public onlyOwner {
        require(
            _fileHashes.length > 0 && 
            _fileHashes.length <= MAX_BATCH_SIZE,
            "Invalid batch size"
        );

        for (uint256 i = 0; i < _fileHashes.length; i++) {
            if (fileRecords[_fileHashes[i]].isActive) {
                fileRecords[_fileHashes[i]].isActive = false;
                emit FileInvalidated(_fileHashes[i]);
            }
        }
    }

    // 获取合约统计信息
    function getContractStats() public view returns (
        uint256 totalStoredFiles, 
        uint256 activeFiles
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < totalRecords; i++) {
            // TODO: 实现高效的活跃记录统计
        }
        return (totalRecords, active);
    }
}
