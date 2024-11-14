import {
  FileRemoved,
  FileStatusUpdated,
  FileUploaded,
  FreeLoadUpdated,
  InstanceLockStatusUpdated,
  InstanceOwnerRegistered,
  OwnershipTransferred,
  MaxLoadUpdated
} from "../generated/InstaShare/InstaShare"
import {
  User,
  File,
  SystemConfig,
  FileHistory,
  UserHistory,
  Statistics
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

// 上传文件
export function handleFileUploaded(event: FileUploaded): void {
  let fileId = event.params.owner.toHexString() + '-' + event.params.cid
  let file = new File(fileId)
  let user = User.load(event.params.owner.toHexString())
  
  if (user != null) {
    file.owner = user.id
    file.cid = event.params.cid
    file.size = event.params.size
    file.fileType = event.params.fileType
    file.fileName = event.params.fileName // 新增fileName字段
    file.isActive = true
    file.status = "ACTIVE"
    file.createdAt = event.block.timestamp
    file.lastUpdated = event.block.timestamp
    file.save()

    // Update user stats
    user.totalFiles = user.totalFiles.plus(BigInt.fromI32(1))
    user.freeLoad = user.freeLoad.minus(event.params.size)
    user.lastUpdated = event.block.timestamp
    user.save()

    // Create file history
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new FileHistory(historyId)
    history.file = fileId
    history.action = "UPLOAD"
    history.actor = event.params.owner.toHexString()
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()

    // Update statistics
    let stats = Statistics.load("1")
    if (stats == null) {
      stats = new Statistics("1")
      stats.totalUsers = BigInt.fromI32(0)
      stats.totalFiles = BigInt.fromI32(0)
      stats.totalStorage = BigInt.fromI32(0)
      stats.activeFiles = BigInt.fromI32(0)
    }
    stats.totalFiles = stats.totalFiles.plus(BigInt.fromI32(1))
    stats.totalStorage = stats.totalStorage.plus(event.params.size)
    stats.activeFiles = stats.activeFiles.plus(BigInt.fromI32(1))
    stats.lastUpdated = event.block.timestamp
    stats.save()
  }
}

// 移除文件
export function handleFileRemoved(event: FileRemoved): void {
  let fileId = event.params.owner.toHexString() + '-' + event.params.cid
  let file = File.load(fileId)
  let user = User.load(event.params.owner.toHexString())
  
  if (file != null && user != null) {
    // Update user stats before file size is cleared
    let fileSize = file.size
    user.totalFiles = user.totalFiles.minus(BigInt.fromI32(1))
    user.freeLoad = user.freeLoad.plus(fileSize)
    user.lastUpdated = event.block.timestamp
    user.save()

    // Create file history
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new FileHistory(historyId)
    history.file = fileId
    history.action = "REMOVE"
    history.actor = event.params.owner.toHexString()
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()

    // Update statistics
    let stats = Statistics.load("1")
    if (stats != null) {
      stats.totalFiles = stats.totalFiles.minus(BigInt.fromI32(1))
      stats.totalStorage = stats.totalStorage.minus(fileSize)
      if (file.isActive) {
        stats.activeFiles = stats.activeFiles.minus(BigInt.fromI32(1))
      }
      stats.lastUpdated = event.block.timestamp
      stats.save()
    }

    // Update the file instead of removing it
    file.isActive = false
    file.status = "REMOVED"
    file.lastUpdated = event.block.timestamp
    file.save()
  }
}

// 处理新用户注册逻辑
export function handleInstanceOwnerRegistered(event: InstanceOwnerRegistered): void {
  let user = new User(event.params.ownerAddress.toHexString())
  user.totalFiles = BigInt.fromI32(0)
  user.freeLoad = event.params.freeLoad
  user.maxLoad = event.params.freeLoad // 新增maxLoad字段，初始值与freeLoad相同
  user.isLocked = event.params.isLocked
  user.createdAt = event.block.timestamp
  user.lastUpdated = event.block.timestamp
  user.save()

  // Create history record
  let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let history = new UserHistory(historyId)
  history.user = user.id
  history.action = "REGISTER"
  history.timestamp = event.block.timestamp
  history.transactionHash = event.transaction.hash.toHexString()
  history.save()

  // Update statistics
  let stats = Statistics.load("1")
  if (stats == null) {
    stats = new Statistics("1")
    stats.totalUsers = BigInt.fromI32(0)
    stats.totalFiles = BigInt.fromI32(0)
    stats.totalStorage = BigInt.fromI32(0)
    stats.activeFiles = BigInt.fromI32(0)
  }
  stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1))
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

// 更新最大容量
export function handleMaxLoadUpdated(event: MaxLoadUpdated): void {
  let user = User.load(event.params.ownerAddress.toHexString())
  
  if (user != null) {
    user.maxLoad = event.params.newMaxLoad
    user.lastUpdated = event.block.timestamp
    user.save()

    // Create history record
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new UserHistory(historyId)
    history.user = user.id
    history.action = "UPDATE_MAXLOAD"
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()
  }
}

// 更新文件状态
export function handleFileStatusUpdated(event: FileStatusUpdated): void {
  let fileId = event.params.owner.toHexString() + '-' + event.params.cid
  let file = File.load(fileId)
  
  if (file != null) {
    file.isActive = event.params.isActive
    file.status = event.params.isActive ? "ACTIVE" : "INACTIVE"
    file.lastUpdated = event.block.timestamp
    file.save()

    // Create history record
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new FileHistory(historyId)
    history.file = fileId
    history.action = "UPDATE"
    history.actor = event.params.owner.toHexString()
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()

    // Update statistics
    let stats = Statistics.load("1")
    if (stats != null) {
      stats.activeFiles = event.params.isActive 
        ? stats.activeFiles.plus(BigInt.fromI32(1))
        : stats.activeFiles.minus(BigInt.fromI32(1))
      stats.lastUpdated = event.block.timestamp
      stats.save()
    }
  }
}

// 更新文件上传
export function handleFreeLoadUpdated(event: FreeLoadUpdated): void {
  let user = User.load(event.params.ownerAddress.toHexString())
  
  if (user != null) {
    user.freeLoad = event.params.freeLoad
    user.lastUpdated = event.block.timestamp
    user.save()

    // Create history record
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new UserHistory(historyId)
    history.user = user.id
    history.action = "UPDATE_FREELOAD"
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()
  }
}

// 更新实例锁定
export function handleInstanceLockStatusUpdated(event: InstanceLockStatusUpdated): void {
  let user = User.load(event.params.owner.toHexString())
  
  if (user != null) {
    user.isLocked = event.params.isLocked
    user.lastUpdated = event.block.timestamp
    user.save()

    // Create history record
    let historyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let history = new UserHistory(historyId)
    history.user = user.id
    history.action = "UPDATE_LOCK_STATUS"
    history.timestamp = event.block.timestamp
    history.transactionHash = event.transaction.hash.toHexString()
    history.save()
  }
}

// 更新实例拥有者
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let config = SystemConfig.load("1")
  if (config == null) {
    config = new SystemConfig("1")
  }
  config.owner = event.params.newOwner.toHexString()
  config.lastUpdated = event.block.timestamp
  config.save()
}
