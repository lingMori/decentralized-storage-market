import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  DataOrderCreated as DataOrderCreatedEvent,
  InstaShareContractUpdated as InstaShareContractUpdatedEvent,
  StorageProviderRegistered as StorageProviderRegisteredEvent
} from "../generated/StorageMarket/StorageMarket"
import {
  StorageProvider,
  Buyer,
  Order,
  MarketStats
} from "../generated/schema"

// ==================== 辅助函数 ====================

/**
 * 获取或创建市场统计实体
 */
function getOrCreateMarketStats(): MarketStats {
  let stats = MarketStats.load("market")
  
  if (stats == null) {
    stats = new MarketStats("market")
    stats.totalProviders = BigInt.fromI32(0)
    stats.activeProviders = BigInt.fromI32(0)
    stats.totalOrders = BigInt.fromI32(0)
    stats.totalBuyers = BigInt.fromI32(0)
    stats.totalStorageAvailable = BigInt.fromI32(0)
    stats.totalStorageSold = BigInt.fromI32(0)
    stats.totalVolume = BigInt.fromI32(0)
    stats.instaShareContract = null
    stats.updatedAt = BigInt.fromI32(0)
  }
  
  return stats
}

/**
 * 获取或创建买家实体
 */
function getOrCreateBuyer(addressBytes: Bytes, timestamp: BigInt): Buyer {
  let address = addressBytes.toHexString()
  let buyer = Buyer.load(address)
  
  if (buyer == null) {
    buyer = new Buyer(address)
    buyer.address = addressBytes
    buyer.totalOrders = BigInt.fromI32(0)
    buyer.totalSpent = BigInt.fromI32(0)
    buyer.createdAt = timestamp
    buyer.updatedAt = timestamp
  }
  
  return buyer
}

// ==================== 事件处理函数 ====================

/**
 * 处理存储提供商注册事件
 */
export function handleStorageProviderRegistered(
  event: StorageProviderRegisteredEvent
): void {
  let sellID = event.params.sellID.toString()
  
  // 创建存储提供商实体
  let provider = new StorageProvider(sellID)
  provider.sellID = event.params.sellID
  provider.providerAddress = event.params.providerAddress
  provider.availableSpace = event.params.availableSpace
  provider.pricePerMBPerMonth = event.params.pricePerMBPerMonth
  provider.stakedETH = event.params.stakedETH
  provider.isValid = true
  provider.totalOrders = BigInt.fromI32(0)
  provider.createdAt = event.block.timestamp
  provider.updatedAt = event.block.timestamp
  provider.save()
  
  // 更新市场统计
  let stats = getOrCreateMarketStats()
  stats.totalProviders = stats.totalProviders.plus(BigInt.fromI32(1))
  stats.activeProviders = stats.activeProviders.plus(BigInt.fromI32(1))
  stats.totalStorageAvailable = stats.totalStorageAvailable.plus(event.params.availableSpace)
  stats.updatedAt = event.block.timestamp
  stats.save()
}

/**
 * 处理数据订单创建事件
 */
export function handleDataOrderCreated(event: DataOrderCreatedEvent): void {
  let orderID = event.params.orderID.toString()
  let sellID = orderID // orderID 通常对应 sellID，根据合约逻辑调整
  
  // 获取或创建买家
  let buyer = getOrCreateBuyer(event.params.buyerAddress, event.block.timestamp)
  buyer.totalOrders = buyer.totalOrders.plus(BigInt.fromI32(1))
  buyer.totalSpent = buyer.totalSpent.plus(event.params.totalCost)
  buyer.updatedAt = event.block.timestamp
  buyer.save()
  
  // 查找对应的存储提供商
  // 注意：由于事件中没有提供 sellID，我们需要通过 providerAddress 来查找
  // 这里使用一个简化的方案：假设已经有对应的 provider 注册
  // 实际中可能需要遍历所有 providers 来匹配地址
  let provider = StorageProvider.load(sellID)
  
  // 如果找不到 provider，创建一个临时的（用于处理边缘情况）
  if (provider == null) {
    let providerAddressStr = event.params.providerAddress.toHexString()
    provider = new StorageProvider(providerAddressStr)
    provider.sellID = BigInt.fromI32(0) // 未知
    provider.providerAddress = event.params.providerAddress
    provider.availableSpace = event.params.storageSpace
    provider.pricePerMBPerMonth = BigInt.fromI32(0) // 未知
    provider.stakedETH = BigInt.fromI32(0) // 未知
    provider.isValid = true
    provider.totalOrders = BigInt.fromI32(0)
    provider.createdAt = event.block.timestamp
    provider.updatedAt = event.block.timestamp
  }
  
  // 更新提供商统计
  provider.totalOrders = provider.totalOrders.plus(BigInt.fromI32(1))
  provider.updatedAt = event.block.timestamp
  provider.save()
  
  // 创建订单实体
  let order = new Order(orderID)
  order.orderID = event.params.orderID
  order.provider = provider.id
  order.buyer = buyer.id
  order.storageSpace = event.params.storageSpace
  order.totalCost = event.params.totalCost
  order.stakedETH = event.params.stakedETH
  order.verificationContract = event.params.verificationContract
  order.createdAt = event.block.timestamp
  order.transactionHash = event.transaction.hash
  order.save()
  
  // 更新市场统计
  let stats = getOrCreateMarketStats()
  stats.totalOrders = stats.totalOrders.plus(BigInt.fromI32(1))
  
  // 如果是新买家，增加买家计数
  if (buyer.totalOrders.equals(BigInt.fromI32(1))) {
    stats.totalBuyers = stats.totalBuyers.plus(BigInt.fromI32(1))
  }
  
  stats.totalStorageSold = stats.totalStorageSold.plus(event.params.storageSpace)
  stats.totalVolume = stats.totalVolume.plus(event.params.totalCost)
  stats.updatedAt = event.block.timestamp
  stats.save()
}

/**
 * 处理 InstaShare 合约更新事件
 */
export function handleInstaShareContractUpdated(
  event: InstaShareContractUpdatedEvent
): void {
  // 更新市场统计中的 InstaShare 合约地址
  let stats = getOrCreateMarketStats()
  stats.instaShareContract = event.params.newAddress
  stats.updatedAt = event.block.timestamp
  stats.save()
}
