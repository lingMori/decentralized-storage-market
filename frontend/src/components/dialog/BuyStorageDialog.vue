<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="emit('update:open', false)"></div>
    <div class="relative z-50 bg-white rounded-lg shadow-lg w-[560px] max-w-[90vw] p-6">
      <h3 class="text-lg font-semibold">购买存储空间</h3>
      <p class="text-sm text-gray-600">确认购买信息后提交交易</p>

      <div class="mt-4 space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-500">节点ID</span>
          <span class="font-mono">#{{ sellID }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">购买空间</span>
          <span class="font-medium">{{ spaceMB }} MB</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">预计总价</span>
          <span class="font-medium">{{ totalCostWei }} wei</span>
        </div>
        <p class="text-xs text-gray-500">实际支付允许 ±5% 浮动（滑点保护）</p>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2">
        <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="emit('update:open', false)">取消</button>
        <button class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" @click="emit('confirm')">确认购买</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
const props = defineProps<{ 
  open: boolean,
  sellID: number | string,
  spaceMB: number | string,
  totalCostWei: number | string
}>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'confirm'): void }>()
</script>

<style scoped>
</style>