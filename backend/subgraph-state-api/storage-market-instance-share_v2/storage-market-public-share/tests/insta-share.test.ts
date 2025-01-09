import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { FileRemoved } from "../generated/schema"
import { FileRemoved as FileRemovedEvent } from "../generated/InstaShare/InstaShare"
import { handleFileRemoved } from "../src/insta-share"
import { createFileRemovedEvent } from "./insta-share-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    let cid = "Example string value"
    let newFileRemovedEvent = createFileRemovedEvent(owner, cid)
    handleFileRemoved(newFileRemovedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FileRemoved created and stored", () => {
    assert.entityCount("FileRemoved", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FileRemoved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "FileRemoved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "cid",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
