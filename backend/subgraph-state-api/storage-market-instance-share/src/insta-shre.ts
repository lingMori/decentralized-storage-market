import {
  FileRemoved as FileRemovedEvent,
  FileStatusUpdated as FileStatusUpdatedEvent,
  FileUploaded as FileUploadedEvent,
  FreeLoadUpdated as FreeLoadUpdatedEvent,
  InstanceLockStatusUpdated as InstanceLockStatusUpdatedEvent,
  InstanceOwnerRegistered as InstanceOwnerRegisteredEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  Unpaused as UnpausedEvent
} from "../generated/InstaShre/InstaShre"
import {
  FileRemoved,
  FileStatusUpdated,
  FileUploaded,
  FreeLoadUpdated,
  InstanceLockStatusUpdated,
  InstanceOwnerRegistered,
  OwnershipTransferred,
  Paused,
  Unpaused
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

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
