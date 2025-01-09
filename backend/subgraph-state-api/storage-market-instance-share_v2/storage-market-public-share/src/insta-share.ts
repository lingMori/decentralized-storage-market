import {
  FileRemoved as FileRemovedEvent,
  FileStatusUpdated as FileStatusUpdatedEvent,
  FileUploaded as FileUploadedEvent,
  FreeLoadUpdated as FreeLoadUpdatedEvent,
  InstanceLockStatusUpdated as InstanceLockStatusUpdatedEvent,
  InstanceOwnerRegistered as InstanceOwnerRegisteredEvent,
  LoadIncreased as LoadIncreasedEvent,
  MaxLoadUpdated as MaxLoadUpdatedEvent
} from "../generated/InstaShare/InstaShare"
import {
  FileRemoved,
  FileStatusUpdated,
  FileUploaded,
  FreeLoadUpdated,
  InstanceLockStatusUpdated,
  InstanceOwnerRegistered,
  LoadIncreased,
  MaxLoadUpdated
} from "../generated/schema"

export function handleFileRemoved(event: FileRemovedEvent): void {
  let entity = new FileRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.cid = event.params.cid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFileStatusUpdated(event: FileStatusUpdatedEvent): void {
  let entity = new FileStatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.cid = event.params.cid
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFileUploaded(event: FileUploadedEvent): void {
  let entity = new FileUploaded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.cid = event.params.cid
  entity.size = event.params.size
  entity.fileType = event.params.fileType
  entity.storageSource = event.params.storageSource
  entity.fileName = event.params.fileName

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFreeLoadUpdated(event: FreeLoadUpdatedEvent): void {
  let entity = new FreeLoadUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ownerAddress = event.params.ownerAddress
  entity.freeLoad = event.params.freeLoad

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInstanceLockStatusUpdated(
  event: InstanceLockStatusUpdatedEvent
): void {
  let entity = new InstanceLockStatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.isLocked = event.params.isLocked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInstanceOwnerRegistered(
  event: InstanceOwnerRegisteredEvent
): void {
  let entity = new InstanceOwnerRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ownerAddress = event.params.ownerAddress
  entity.freeLoad = event.params.freeLoad
  entity.isLocked = event.params.isLocked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLoadIncreased(event: LoadIncreasedEvent): void {
  let entity = new LoadIncreased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.additionalLoad = event.params.additionalLoad

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxLoadUpdated(event: MaxLoadUpdatedEvent): void {
  let entity = new MaxLoadUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newMaxLoad = event.params.newMaxLoad
  entity.ownerAddress = event.params.ownerAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
