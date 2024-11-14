import { ethers } from "ethers";

// FileInfo 结构体
export interface FileInfo {
  cid: string;
  size: ethers.BigNumber;
  timestamp: ethers.BigNumber;
  fileType: string;
  isActive: boolean;
  exists: boolean;
}

// InstanceOwner 结构体
export interface InstanceOwner {
  ownerAddress: string;
  freeLoad: ethers.BigNumber;
  maxLoad: ethers.BigNumber;
  isLocked: boolean;
  totalFiles: ethers.BigNumber;
}

// 合约事件过滤器接口
export interface InstaShareEventFilters {
  [key: string]: (...args: any[]) => ethers.EventFilter; // Added index signature
  FileRemoved(owner?: string, cid?: string): ethers.EventFilter;
  FileStatusUpdated(owner?: string, cid?: string, isActive?: boolean): ethers.EventFilter;
  FileUploaded(
    owner?: string,
    cid?: string,
    size?: ethers.BigNumber,
    fileType?: string,
    fileName?: string
  ): ethers.EventFilter;
  FreeLoadUpdated(ownerAddress?: string, freeLoad?: ethers.BigNumber): ethers.EventFilter;
  InstanceLockStatusUpdated(owner?: string, isLocked?: boolean): ethers.EventFilter;
  InstanceOwnerRegistered(
    ownerAddress?: string,
    freeLoad?: ethers.BigNumber,
    isLocked?: boolean
  ): ethers.EventFilter;
  MaxLoadUpdated(newMaxLoad?: ethers.BigNumber, ownerAddress?: string): ethers.EventFilter;
  OwnershipTransferred(previousOwner?: string, newOwner?: string): ethers.EventFilter;
  Paused(account?: string): ethers.EventFilter;
  Unpaused(account?: string): ethers.EventFilter;
}

// 合约接口
export interface InstaShareContract extends ethers.Contract {
  // 查询方法
  getFileInfo(owner: string, cid: string): Promise<FileInfo>;
  getFileList(owner: string): Promise<string[]>;
  getUserStats(owner: string): Promise<[
    ethers.BigNumber, // totalFiles
    ethers.BigNumber, // freeLoad
    boolean          // isLocked
  ]>;
  instanceOwners(address: string): Promise<InstanceOwner>;
  owner(): Promise<string>;
  paused(): Promise<boolean>;

  // 交易方法
  registerInstanceOwner(): Promise<ethers.ContractTransaction>;
  removeFile(cid: string): Promise<ethers.ContractTransaction>;
  renounceOwnership(): Promise<ethers.ContractTransaction>;
  setInstanceLock(ownerAddress: string, locked: boolean): Promise<ethers.ContractTransaction>;
  transferOwnership(newOwner: string): Promise<ethers.ContractTransaction>;
  unpause(): Promise<ethers.ContractTransaction>;
  updateFileStatus(cid: string, isActive: boolean): Promise<ethers.ContractTransaction>;
  updateMaxLoad(newMaxLoad: ethers.BigNumber, ownerAddress: string): Promise<ethers.ContractTransaction>;
  uploadFile(
    cid: string,
    fileSize: ethers.BigNumber,
    fileType: string,
    fileName: string
  ): Promise<ethers.ContractTransaction>;

  // 事件过滤器
  filters: InstaShareEventFilters;
}

// Hook 返回类型
export interface InstaShareHook {
  getSigner: () => ethers.Signer;
  getContract: () => InstaShareContract;
}
