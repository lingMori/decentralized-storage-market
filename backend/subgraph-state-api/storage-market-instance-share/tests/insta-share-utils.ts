import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
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
} from "../generated/InstaShare/InstaShare"

export function createFileRemovedEvent(
  owner: Address,
  cid: string
): FileRemoved {
  let fileRemovedEvent = changetype<FileRemoved>(newMockEvent())

  fileRemovedEvent.parameters = new Array()

  fileRemovedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  fileRemovedEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )

  return fileRemovedEvent
}

export function createFileStatusUpdatedEvent(
  owner: Address,
  cid: string,
  isActive: boolean
): FileStatusUpdated {
  let fileStatusUpdatedEvent = changetype<FileStatusUpdated>(newMockEvent())

  fileStatusUpdatedEvent.parameters = new Array()

  fileStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  fileStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )
  fileStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return fileStatusUpdatedEvent
}

export function createFileUploadedEvent(
  owner: Address,
  cid: string,
  size: BigInt,
  fileType: string,
  fileName: string
): FileUploaded {
  let fileUploadedEvent = changetype<FileUploaded>(newMockEvent())

  fileUploadedEvent.parameters = new Array()

  fileUploadedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  fileUploadedEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )
  fileUploadedEvent.parameters.push(
    new ethereum.EventParam("size", ethereum.Value.fromUnsignedBigInt(size))
  )
  fileUploadedEvent.parameters.push(
    new ethereum.EventParam("fileType", ethereum.Value.fromString(fileType))
  )
  fileUploadedEvent.parameters.push(
    new ethereum.EventParam("fileName", ethereum.Value.fromString(fileName))
  )

  return fileUploadedEvent
}

export function createFreeLoadUpdatedEvent(
  ownerAddress: Address,
  freeLoad: BigInt
): FreeLoadUpdated {
  let freeLoadUpdatedEvent = changetype<FreeLoadUpdated>(newMockEvent())

  freeLoadUpdatedEvent.parameters = new Array()

  freeLoadUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "ownerAddress",
      ethereum.Value.fromAddress(ownerAddress)
    )
  )
  freeLoadUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "freeLoad",
      ethereum.Value.fromUnsignedBigInt(freeLoad)
    )
  )

  return freeLoadUpdatedEvent
}

export function createInstanceLockStatusUpdatedEvent(
  owner: Address,
  isLocked: boolean
): InstanceLockStatusUpdated {
  let instanceLockStatusUpdatedEvent = changetype<InstanceLockStatusUpdated>(
    newMockEvent()
  )

  instanceLockStatusUpdatedEvent.parameters = new Array()

  instanceLockStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  instanceLockStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("isLocked", ethereum.Value.fromBoolean(isLocked))
  )

  return instanceLockStatusUpdatedEvent
}

export function createInstanceOwnerRegisteredEvent(
  ownerAddress: Address,
  freeLoad: BigInt,
  isLocked: boolean
): InstanceOwnerRegistered {
  let instanceOwnerRegisteredEvent = changetype<InstanceOwnerRegistered>(
    newMockEvent()
  )

  instanceOwnerRegisteredEvent.parameters = new Array()

  instanceOwnerRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "ownerAddress",
      ethereum.Value.fromAddress(ownerAddress)
    )
  )
  instanceOwnerRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "freeLoad",
      ethereum.Value.fromUnsignedBigInt(freeLoad)
    )
  )
  instanceOwnerRegisteredEvent.parameters.push(
    new ethereum.EventParam("isLocked", ethereum.Value.fromBoolean(isLocked))
  )

  return instanceOwnerRegisteredEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
