import { newMockEvent } from "matchstick-as"
import { ethereum } from "@graphprotocol/graph-ts"
import { BatchSet } from "../generated/PublicShareSimple/PublicShareSimple"

export function createBatchSetEvent(
  _keys: Array<string>,
  _values: Array<string>
): BatchSet {
  let batchSetEvent = changetype<BatchSet>(newMockEvent())

  batchSetEvent.parameters = new Array()

  batchSetEvent.parameters.push(
    new ethereum.EventParam("_keys", ethereum.Value.fromStringArray(_keys))
  )
  batchSetEvent.parameters.push(
    new ethereum.EventParam("_values", ethereum.Value.fromStringArray(_values))
  )

  return batchSetEvent
}
