<template>
  <div class="border rounded-lg p-4 hover:shadow-sm transition">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-medium">节点 #{{ toNum(provider.sellID) }}</h3>
        <p class="text-xs text-gray-500 font-mono truncate" :title="provider.providerAddress">
          {{ provider.providerAddress }}
        </p>
      </div>
      <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">{{ provider.status || 'ACTIVE' }}</span>
    </div>

    <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
      <div>
        <p class="text-gray-500">可用空间</p>
        <p class="font-medium">{{ toNum(provider.availableSpace) }} MB</p>
      </div>
      <div>
        <p class="text-gray-500">每月单价</p>
        <p class="font-medium">{{ toNum(provider.pricePerMBPerMonth) }} wei/MB</p>
      </div>
      <div>
        <p class="text-gray-500">质押金额</p>
        <p class="font-medium">{{ toNum(provider.stakedETH) }} wei</p>
      </div>
      <div>
        <p class="text-gray-500">信誉/在线率</p>
        <p class="font-medium">— / —</p>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-end gap-2">
      <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="$emit('view', toNum(provider.sellID))">查看详情</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProviderInfoLike {
  sellID: any
  providerAddress: string
  availableSpace: any
  pricePerMBPerMonth: any
  stakedETH: any
  status?: string
}

defineProps<{ provider: ProviderInfoLike }>()
defineEmits<{ (e: 'view', sellID: number): void }>()

function toNum(n: any) {
  try { return typeof n === 'object' && n?._isBigNumber ? Number(n.toString()) : Number(n) } catch { return n }
}
</script>

<style scoped>
</style>