import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { DataOrderCreated } from "../generated/schema"
import { DataOrderCreated as DataOrderCreatedEvent } from "../generated/StorageMarket/StorageMarket"
import { handleDataOrderCreated } from "../src/storage-market"
import { createDataOrderCreatedEvent } from "./storage-market-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orderID = BigInt.fromI32(234)
    let providerAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let buyerAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let storageSpace = BigInt.fromI32(234)
    let totalCost = BigInt.fromI32(234)
    let stakedETH = BigInt.fromI32(234)
    let verificationContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newDataOrderCreatedEvent = createDataOrderCreatedEvent(
      orderID,
      providerAddress,
      buyerAddress,
      storageSpace,
      totalCost,
      stakedETH,
      verificationContract
    )
    handleDataOrderCreated(newDataOrderCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("DataOrderCreated created and stored", () => {
    assert.entityCount("DataOrderCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orderID",
      "234"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "providerAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "buyerAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "storageSpace",
      "234"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totalCost",
      "234"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "stakedETH",
      "234"
    )
    assert.fieldEquals(
      "DataOrderCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "verificationContract",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
