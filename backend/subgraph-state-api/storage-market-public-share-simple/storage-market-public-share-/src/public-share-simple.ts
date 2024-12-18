import { BatchSet as BatchSetEvent } from '../generated/PublicShareSimple/PublicShareSimple'
import { KeyValuePair } from '../generated/schema'

export function handleBatchSet(event: BatchSetEvent): void {
  const keys = event.params._keys
  const values = event.params._values

  for (let i = 0; i < keys.length; i++) {
    const id = keys[i]

    // 尝试加载已存在的 KeyValuePair
    let keyValuePair = KeyValuePair.load(id)

    // 如果不存在，创建新的 KeyValuePair
    if (keyValuePair === null) {
      keyValuePair = new KeyValuePair(id)
    }

    // 覆盖 key 和 value
    keyValuePair.key = keys[i]
    keyValuePair.value = values[i]
    keyValuePair.blockTimestamp = event.block.timestamp

    // 保存 KeyValuePair
    keyValuePair.save()
  }
}
