// src/mapping.ts
import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  StorageProviderRegistered,
  DataOrderCreated
} from "../generated/StorageMarket/StorageMarket"

import { 
  StorageProvider, 
  DataOrder, 
  StorageFile, 
  FileVerification 
} from "../generated/schema"

// 处理存储提供商注册事件
export function handleStorageProviderRegistered(event: StorageProviderRegistered): void {
  const id = event.params.sellID.toString()
  let provider = new StorageProvider(id)
  
  provider.sellID = event.params.sellID
  provider.providerAddress = event.params.providerAddress
  provider.availableSpace = event.params.availableSpace
  provider.pricePerMBPerMonth = event.params.pricePerMBPerMonth
  provider.stakedETH = event.params.stakedETH
  provider.isValid = true
  provider.createdAt = event.block.timestamp
  provider.updatedAt = event.block.timestamp
  
  provider.save()
}

// 处理数据订单创建事件
export function handleDataOrderCreated(event: DataOrderCreated): void {
  const id = event.params.orderID.toString()
  let order = new DataOrder(id)
  
  order.orderID = event.params.orderID
  order.provider = event.params.providerAddress.toHexString()
  order.buyerAddress = event.params.buyerAddress
  order.storageSpace = event.params.storageSpace
  order.totalCost = event.params.totalCost
  order.stakedETH = event.params.stakedETH
  order.verificationContract = event.params.verificationContract
  order.createdAt = event.block.timestamp
  
  order.save()
}
