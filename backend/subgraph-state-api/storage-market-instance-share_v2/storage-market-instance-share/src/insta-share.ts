import {
  FileRemoved as FileRemovedEvent,
  FileStatusUpdated as FileStatusUpdatedEvent,
  FileUploaded as FileUploadedEvent,
  FreeLoadUpdated as FreeLoadUpdatedEvent,
  InstanceLockStatusUpdated as InstanceLockStatusUpdatedEvent,
  InstanceOwnerRegistered as InstanceOwnerRegisteredEvent,
  MaxLoadUpdated as MaxLoadUpdatedEvent,
  StorageNodeAdded as StorageNodeAddedEvent,
  StorageNodeDeactivated as StorageNodeDeactivatedEvent,
  StorageNodeUpdated as StorageNodeUpdatedEvent
} from "../generated/InstaShare/InstaShare"
import {
  User,
  File,
  StorageNode,
  SystemStats
} from "../generated/schema"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"

// ==================== 辅助函数 ====================

/**
 * 获取或创建用户实体
 */
function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address.toHexString())
  
  if (user == null) {
    user = new User(address.toHexString())
    user.address = address
    user.totalFiles = BigInt.fromI32(0)
    user.freeLoad = BigInt.fromI32(0)
    user.maxLoad = BigInt.fromI32(0)
    user.isLocked = false
    user.totalNodes = BigInt.fromI32(0)
    user.createdAt = timestamp
    user.updatedAt = timestamp
    user.save()
    
    // 更新系统统计
    let stats = getOrCreateSystemStats()
    stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1))
    stats.updatedAt = timestamp
    stats.save()
  }
  
  return user as User
}

/**
 * 获取或创建系统统计实体
 */
function getOrCreateSystemStats(): SystemStats {
  let stats = SystemStats.load("system")
  
  if (stats == null) {
    stats = new SystemStats("system")
    stats.totalUsers = BigInt.fromI32(0)
    stats.totalFiles = BigInt.fromI32(0)
    stats.activeFiles = BigInt.fromI32(0)
    stats.totalStorage = BigInt.fromI32(0)
    stats.totalNodes = BigInt.fromI32(0)
    stats.activeNodes = BigInt.fromI32(0)
    stats.updatedAt = BigInt.fromI32(0)
    stats.save()
  }
  
  return stats as SystemStats
}

// ==================== 事件处理函数 ====================

/**
 * 处理用户注册事件
 */
export function handleInstanceOwnerRegistered(event: InstanceOwnerRegisteredEvent): void {
  let user = getOrCreateUser(event.params.ownerAddress, event.block.timestamp)
  user.freeLoad = event.params.freeLoad
  user.isLocked = event.params.isLocked
  user.updatedAt = event.block.timestamp
  user.save()
}

/**
 * 处理文件上传事件
 */
export function handleFileUploaded(event: FileUploadedEvent): void {
  let user = getOrCreateUser(event.params.owner, event.block.timestamp)
  
  // 创建文件 ID: owner地址 + cid
  let fileId = event.params.owner.toHexString() + "-" + event.params.cid
  let file = new File(fileId)
  
  file.cid = event.params.cid
  file.owner = user.id
  file.size = event.params.size
  file.fileType = event.params.fileType
  file.fileName = event.params.fileName
  file.storageNodeId = event.params.storageNodeId
  file.isActive = true
  file.status = "ACTIVE"
  file.createdAt = event.block.timestamp
  file.updatedAt = event.block.timestamp
  
  // 如果使用了存储节点，关联到节点
  if (event.params.storageNodeId.gt(BigInt.fromI32(0))) {
    let nodeId = event.params.owner.toHexString() + "-" + event.params.storageNodeId.toString()
    file.storageNode = nodeId
    
    // 更新存储节点的使用空间
    let node = StorageNode.load(nodeId)
    if (node != null) {
      node.usedSpace = node.usedSpace.plus(event.params.size)
      node.availableSpace = node.totalSpace.minus(node.usedSpace)
      node.updatedAt = event.block.timestamp
      node.save()
    }
  }
  
  file.save()
  
  // 更新用户统计
  user.totalFiles = user.totalFiles.plus(BigInt.fromI32(1))
  user.updatedAt = event.block.timestamp
  user.save()
  
  // 更新系统统计
  let stats = getOrCreateSystemStats()
  stats.totalFiles = stats.totalFiles.plus(BigInt.fromI32(1))
  stats.activeFiles = stats.activeFiles.plus(BigInt.fromI32(1))
  stats.totalStorage = stats.totalStorage.plus(event.params.size)
  stats.updatedAt = event.block.timestamp
  stats.save()
}

/**
 * 处理文件状态更新事件
 */
export function handleFileStatusUpdated(event: FileStatusUpdatedEvent): void {
  let fileId = event.params.owner.toHexString() + "-" + event.params.cid
  let file = File.load(fileId)
  
  if (file != null) {
    let wasActive = file.isActive
    file.isActive = event.params.isActive
    file.status = event.params.isActive ? "ACTIVE" : "INACTIVE"
    file.updatedAt = event.block.timestamp
    file.save()
    
    // 更新系统统计中的活跃文件数
    let stats = getOrCreateSystemStats()
    if (wasActive && !event.params.isActive) {
      // 从活跃变为不活跃
      stats.activeFiles = stats.activeFiles.minus(BigInt.fromI32(1))
    } else if (!wasActive && event.params.isActive) {
      // 从不活跃变为活跃
      stats.activeFiles = stats.activeFiles.plus(BigInt.fromI32(1))
    }
    stats.updatedAt = event.block.timestamp
    stats.save()
  }
}

/**
 * 处理文件删除事件
 */
export function handleFileRemoved(event: FileRemovedEvent): void {
  let fileId = event.params.owner.toHexString() + "-" + event.params.cid
  let file = File.load(fileId)
  
  if (file != null) {
    let wasActive = file.isActive
    let fileSize = file.size
    let storageNodeId = file.storageNode
    
    // 更新文件状态
    file.isActive = false
    file.status = "REMOVED"
    file.removedAt = event.block.timestamp
    file.updatedAt = event.block.timestamp
    file.save()
    
    // 如果文件在存储节点上，更新节点空间
    if (storageNodeId != null) {
      let node = StorageNode.load(storageNodeId as string)
      if (node != null) {
        node.usedSpace = node.usedSpace.minus(fileSize)
        node.availableSpace = node.totalSpace.minus(node.usedSpace)
        node.updatedAt = event.block.timestamp
        node.save()
      }
    }
    
    // 更新用户统计
    let user = User.load(file.owner)
    if (user != null) {
      user.totalFiles = user.totalFiles.minus(BigInt.fromI32(1))
      user.updatedAt = event.block.timestamp
      user.save()
    }
    
    // 更新系统统计
    let stats = getOrCreateSystemStats()
    stats.totalFiles = stats.totalFiles.minus(BigInt.fromI32(1))
    if (wasActive) {
      stats.activeFiles = stats.activeFiles.minus(BigInt.fromI32(1))
    }
    stats.totalStorage = stats.totalStorage.minus(fileSize)
    stats.updatedAt = event.block.timestamp
    stats.save()
  }
}

/**
 * 处理免费空间更新事件
 */
export function handleFreeLoadUpdated(event: FreeLoadUpdatedEvent): void {
  let user = getOrCreateUser(event.params.ownerAddress, event.block.timestamp)
  user.freeLoad = event.params.freeLoad
  user.updatedAt = event.block.timestamp
  user.save()
}

/**
 * 处理最大空间更新事件
 */
export function handleMaxLoadUpdated(event: MaxLoadUpdatedEvent): void {
  let user = getOrCreateUser(event.params.ownerAddress, event.block.timestamp)
  user.maxLoad = event.params.newMaxLoad
  user.updatedAt = event.block.timestamp
  user.save()
}

/**
 * 处理实例锁定状态更新事件
 */
export function handleInstanceLockStatusUpdated(event: InstanceLockStatusUpdatedEvent): void {
  let user = getOrCreateUser(event.params.owner, event.block.timestamp)
  user.isLocked = event.params.isLocked
  user.updatedAt = event.block.timestamp
  user.save()
}

/**
 * 处理存储节点添加事件
 */
export function handleStorageNodeAdded(event: StorageNodeAddedEvent): void {
  let user = getOrCreateUser(event.params.owner, event.block.timestamp)
  
  // 创建存储节点 ID: owner地址 + nodeId
  let nodeId = event.params.owner.toHexString() + "-" + event.params.nodeId.toString()
  let node = new StorageNode(nodeId)
  
  node.nodeId = event.params.nodeId
  node.owner = user.id
  node.providerAddress = event.params.providerAddress
  node.totalSpace = event.params.totalSpace
  node.usedSpace = BigInt.fromI32(0)
  node.availableSpace = event.params.totalSpace
  node.isActive = true
  node.purchaseTime = event.block.timestamp
  node.createdAt = event.block.timestamp
  node.updatedAt = event.block.timestamp
  node.save()
  
  // 更新用户统计
  user.totalNodes = user.totalNodes.plus(BigInt.fromI32(1))
  user.updatedAt = event.block.timestamp
  user.save()
  
  // 更新系统统计
  let stats = getOrCreateSystemStats()
  stats.totalNodes = stats.totalNodes.plus(BigInt.fromI32(1))
  stats.activeNodes = stats.activeNodes.plus(BigInt.fromI32(1))
  stats.updatedAt = event.block.timestamp
  stats.save()
}

/**
 * 处理存储节点更新事件
 */
export function handleStorageNodeUpdated(event: StorageNodeUpdatedEvent): void {
  let nodeId = event.params.owner.toHexString() + "-" + event.params.nodeId.toString()
  let node = StorageNode.load(nodeId)
  
  if (node != null) {
    node.usedSpace = event.params.usedSpace
    node.availableSpace = event.params.availableSpace
    node.updatedAt = event.block.timestamp
    node.save()
  }
}

/**
 * 处理存储节点停用事件
 */
export function handleStorageNodeDeactivated(event: StorageNodeDeactivatedEvent): void {
  let nodeId = event.params.owner.toHexString() + "-" + event.params.nodeId.toString()
  let node = StorageNode.load(nodeId)
  
  if (node != null) {
    let wasActive = node.isActive
    node.isActive = false
    node.deactivatedAt = event.block.timestamp
    node.updatedAt = event.block.timestamp
    node.save()
    
    // 更新系统统计中的活跃节点数
    if (wasActive) {
      let stats = getOrCreateSystemStats()
      stats.activeNodes = stats.activeNodes.minus(BigInt.fromI32(1))
      stats.updatedAt = event.block.timestamp
      stats.save()
    }
  }
}
