import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  DataOrderCreated,
  InstaShareContractUpdated,
  StorageProviderRegistered
} from "../generated/StorageMarket/StorageMarket"

export function createDataOrderCreatedEvent(
  orderID: BigInt,
  providerAddress: Address,
  buyerAddress: Address,
  storageSpace: BigInt,
  totalCost: BigInt,
  stakedETH: BigInt,
  verificationContract: Address
): DataOrderCreated {
  let dataOrderCreatedEvent = changetype<DataOrderCreated>(newMockEvent())

  dataOrderCreatedEvent.parameters = new Array()

  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "orderID",
      ethereum.Value.fromUnsignedBigInt(orderID)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "providerAddress",
      ethereum.Value.fromAddress(providerAddress)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "buyerAddress",
      ethereum.Value.fromAddress(buyerAddress)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "storageSpace",
      ethereum.Value.fromUnsignedBigInt(storageSpace)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalCost",
      ethereum.Value.fromUnsignedBigInt(totalCost)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "stakedETH",
      ethereum.Value.fromUnsignedBigInt(stakedETH)
    )
  )
  dataOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "verificationContract",
      ethereum.Value.fromAddress(verificationContract)
    )
  )

  return dataOrderCreatedEvent
}

export function createInstaShareContractUpdatedEvent(
  newAddress: Address
): InstaShareContractUpdated {
  let instaShareContractUpdatedEvent =
    changetype<InstaShareContractUpdated>(newMockEvent())

  instaShareContractUpdatedEvent.parameters = new Array()

  instaShareContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newAddress",
      ethereum.Value.fromAddress(newAddress)
    )
  )

  return instaShareContractUpdatedEvent
}

export function createStorageProviderRegisteredEvent(
  sellID: BigInt,
  providerAddress: Address,
  availableSpace: BigInt,
  pricePerMBPerMonth: BigInt,
  stakedETH: BigInt
): StorageProviderRegistered {
  let storageProviderRegisteredEvent =
    changetype<StorageProviderRegistered>(newMockEvent())

  storageProviderRegisteredEvent.parameters = new Array()

  storageProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam("sellID", ethereum.Value.fromUnsignedBigInt(sellID))
  )
  storageProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "providerAddress",
      ethereum.Value.fromAddress(providerAddress)
    )
  )
  storageProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "availableSpace",
      ethereum.Value.fromUnsignedBigInt(availableSpace)
    )
  )
  storageProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "pricePerMBPerMonth",
      ethereum.Value.fromUnsignedBigInt(pricePerMBPerMonth)
    )
  )
  storageProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "stakedETH",
      ethereum.Value.fromUnsignedBigInt(stakedETH)
    )
  )

  return storageProviderRegisteredEvent
}
