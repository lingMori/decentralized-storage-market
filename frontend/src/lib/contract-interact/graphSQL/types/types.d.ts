// InstaShare 类型定义文件

export enum FileStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE", 
    REMOVED = "REMOVED"
  }
  
  export interface User {
    id: string;                    // address
    totalFiles: bigint;            // 文件总数
    freeLoad: bigint;              // 可用空间
    maxLoad: bigint;               // 最大空间
    isLocked: boolean;             // 是否被锁定
    files: File[];                 // 用户拥有的文件
    createdAt: bigint;             // 注册时间
    lastUpdated: bigint;           // 最后更新时间
  }
  
  export interface File {
    id: string;                    // unique id (owner address + cid)
    cid: string;                   // IPFS CID
    owner: User;                   // 文件所有者
    size: bigint;                  // 文件大小
    fileType: string;              // 文件类型
    fileName: string;              // 文件名
    storageSource: string;         // 存储源
    isActive: boolean;             // 是否激活
    createdAt: bigint;             // 创建时间
    lastUpdated: bigint;           // 最后更新时间
    status: FileStatus;            // 文件状态
  }
  
  export interface SystemConfig {
    id: string;                    // 唯一标识符 (通常为 "1")
    owner: string;                 // 合约所有者地址
    paused: boolean;               // 系统是否暂停
    lastUpdated: bigint;           // 最后更新时间
  }
  
  export interface FileHistory {
    id: string;                    // 唯一标识符 (transaction hash + log index)
    file: File;                    // 关联的文件
    action: string;                // 操作类型 (UPLOAD/REMOVE/UPDATE)
    actor: string;                 // 执行操作的地址
    timestamp: bigint;             // 操作时间
    transactionHash: string;       // 交易哈希
  }
  
  export interface UserHistory {
    id: string;                    // 唯一标识符 (transaction hash + log index)
    user: User;                    // 关联的用户
    action: string;                // 操作类型 (REGISTER/UPDATE/LOCK)
    oldValue?: string;             // 旧值
    newValue?: string;             // 新值
    timestamp: bigint;             // 操作时间
    transactionHash: string;       // 交易哈希
  }
  
  export interface Statistics {
    id: string;                    // 唯一标识符 (通常为 "1")
    totalUsers: bigint;            // 总用户数
    totalFiles: bigint;            // 总文件数
    totalStorage: bigint;          // 总存储使用量
    activeFiles: bigint;           // 活跃文件数
    lastUpdated: bigint;           // 最后更新时间
  }
