import { BatchSet as BatchSetEvent } from "../generated/PublicShareSimple/PublicShareSimple"
import { BatchSet } from "../generated/schema"

export function handleBatchSet(event: BatchSetEvent): void {
  let entity = new BatchSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._keys = event.params._keys
  entity._values = event.params._values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
