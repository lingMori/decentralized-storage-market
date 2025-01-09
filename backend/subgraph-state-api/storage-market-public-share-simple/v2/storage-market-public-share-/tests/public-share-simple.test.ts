import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import {} from "@graphprotocol/graph-ts"
import { BatchSet } from "../generated/schema"
import { BatchSet as BatchSetEvent } from "../generated/PublicShareSimple/PublicShareSimple"
import { handleBatchSet } from "../src/public-share-simple"
import { createBatchSetEvent } from "./public-share-simple-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _keys = ["Example string value"]
    let _values = ["Example string value"]
    let newBatchSetEvent = createBatchSetEvent(_keys, _values)
    handleBatchSet(newBatchSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BatchSet created and stored", () => {
    assert.entityCount("BatchSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BatchSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_keys",
      "[Example string value]"
    )
    assert.fieldEquals(
      "BatchSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_values",
      "[Example string value]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
