import {
  DataOrderCreated as DataOrderCreatedEvent,
  InstaShareContractUpdated as InstaShareContractUpdatedEvent,
  StorageProviderRegistered as StorageProviderRegisteredEvent
} from "../generated/StorageMarket/StorageMarket"
import {
  DataOrderCreated,
  InstaShareContractUpdated,
  StorageProviderRegistered
} from "../generated/schema"

export function handleDataOrderCreated(event: DataOrderCreatedEvent): void {
  let entity = new DataOrderCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orderID = event.params.orderID
  entity.providerAddress = event.params.providerAddress
  entity.buyerAddress = event.params.buyerAddress
  entity.storageSpace = event.params.storageSpace
  entity.totalCost = event.params.totalCost
  entity.stakedETH = event.params.stakedETH
  entity.verificationContract = event.params.verificationContract

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInstaShareContractUpdated(
  event: InstaShareContractUpdatedEvent
): void {
  let entity = new InstaShareContractUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newAddress = event.params.newAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStorageProviderRegistered(
  event: StorageProviderRegisteredEvent
): void {
  let entity = new StorageProviderRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sellID = event.params.sellID
  entity.providerAddress = event.params.providerAddress
  entity.availableSpace = event.params.availableSpace
  entity.pricePerMBPerMonth = event.params.pricePerMBPerMonth
  entity.stakedETH = event.params.stakedETH

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
