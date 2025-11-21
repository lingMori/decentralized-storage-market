<template>
  <div class="flex items-center gap-2">
    <button
      v-if="!account"
      class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
      @click="connect"
    >连接钱包</button>
    <div v-else class="flex items-center gap-2">
      <span class="px-2 py-1 rounded bg-gray-100 font-mono text-xs">{{ shortAddress }}</span>
      <button class="text-xs text-blue-600 hover:underline" @click="copy">复制</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const account = ref<string>('')

const shortAddress = computed(() => {
  const a = account.value
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : ''
})

const getAccounts = async () => {
  try {
    // eth_accounts 不会弹窗，读取当前连接状态
    const accs: string[] = await (window as any).ethereum?.request?.({ method: 'eth_accounts' })
    account.value = accs?.[0] || ''
  } catch {}
}

const connect = async () => {
  try {
    if (!(window as any).ethereum) return
    const accs: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
    account.value = accs?.[0] || ''
  } catch {}
}

const copy = async () => {
  try {
    if (!account.value) return
    await navigator.clipboard.writeText(account.value)
  } catch {}
}

onMounted(getAccounts)
</script>

<style scoped>
</style>