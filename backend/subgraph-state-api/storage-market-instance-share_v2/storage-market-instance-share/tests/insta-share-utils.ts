import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FileRemoved,
  FileStatusUpdated,
  FileUploaded,
  FreeLoadUpdated,
  InstanceLockStatusUpdated,
  InstanceOwnerRegistered,
  MaxLoadUpdated,
  StorageNodeAdded,
  StorageNodeDeactivated,
  StorageNodeUpdated
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
  fileName: string,
  storageNodeId: BigInt
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
  fileUploadedEvent.parameters.push(
    new ethereum.EventParam(
      "storageNodeId",
      ethereum.Value.fromUnsignedBigInt(storageNodeId)
    )
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
  let instanceLockStatusUpdatedEvent =
    changetype<InstanceLockStatusUpdated>(newMockEvent())

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
  let instanceOwnerRegisteredEvent =
    changetype<InstanceOwnerRegistered>(newMockEvent())

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

export function createMaxLoadUpdatedEvent(
  newMaxLoad: BigInt,
  ownerAddress: Address
): MaxLoadUpdated {
  let maxLoadUpdatedEvent = changetype<MaxLoadUpdated>(newMockEvent())

  maxLoadUpdatedEvent.parameters = new Array()

  maxLoadUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newMaxLoad",
      ethereum.Value.fromUnsignedBigInt(newMaxLoad)
    )
  )
  maxLoadUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "ownerAddress",
      ethereum.Value.fromAddress(ownerAddress)
    )
  )

  return maxLoadUpdatedEvent
}

export function createStorageNodeAddedEvent(
  owner: Address,
  nodeId: BigInt,
  providerAddress: Address,
  totalSpace: BigInt
): StorageNodeAdded {
  let storageNodeAddedEvent = changetype<StorageNodeAdded>(newMockEvent())

  storageNodeAddedEvent.parameters = new Array()

  storageNodeAddedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  storageNodeAddedEvent.parameters.push(
    new ethereum.EventParam("nodeId", ethereum.Value.fromUnsignedBigInt(nodeId))
  )
  storageNodeAddedEvent.parameters.push(
    new ethereum.EventParam(
      "providerAddress",
      ethereum.Value.fromAddress(providerAddress)
    )
  )
  storageNodeAddedEvent.parameters.push(
    new ethereum.EventParam(
      "totalSpace",
      ethereum.Value.fromUnsignedBigInt(totalSpace)
    )
  )

  return storageNodeAddedEvent
}

export function createStorageNodeDeactivatedEvent(
  owner: Address,
  nodeId: BigInt
): StorageNodeDeactivated {
  let storageNodeDeactivatedEvent =
    changetype<StorageNodeDeactivated>(newMockEvent())

  storageNodeDeactivatedEvent.parameters = new Array()

  storageNodeDeactivatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  storageNodeDeactivatedEvent.parameters.push(
    new ethereum.EventParam("nodeId", ethereum.Value.fromUnsignedBigInt(nodeId))
  )

  return storageNodeDeactivatedEvent
}

export function createStorageNodeUpdatedEvent(
  owner: Address,
  nodeId: BigInt,
  usedSpace: BigInt,
  availableSpace: BigInt
): StorageNodeUpdated {
  let storageNodeUpdatedEvent = changetype<StorageNodeUpdated>(newMockEvent())

  storageNodeUpdatedEvent.parameters = new Array()

  storageNodeUpdatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  storageNodeUpdatedEvent.parameters.push(
    new ethereum.EventParam("nodeId", ethereum.Value.fromUnsignedBigInt(nodeId))
  )
  storageNodeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "usedSpace",
      ethereum.Value.fromUnsignedBigInt(usedSpace)
    )
  )
  storageNodeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "availableSpace",
      ethereum.Value.fromUnsignedBigInt(availableSpace)
    )
  )

  return storageNodeUpdatedEvent
}
