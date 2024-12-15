import { Bytes, JSONValue, log } from '@graphprotocol/graph-ts'
import { BatchSet as BatchSetEvent } from '../generated/PublicShareSimple/PublicShareSimple'
import { KeyValuePair } from '../generated/schema'

export function handleBatchSet(event: BatchSetEvent): void {
  const keys = event.params._keys
  const values = event.params._values

  for (let i = 0; i < keys.length; i++) {
    const id = keys[i]
    const keyValuePair = new KeyValuePair(id)
    
    keyValuePair.key = keys[i]
    keyValuePair.value = values[i]
    keyValuePair.blockTimestamp = event.block.timestamp

    keyValuePair.save()
  }
}
