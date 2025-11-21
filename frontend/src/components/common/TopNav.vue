<template>
  <header class="w-full sticky top-0 z-30 bg-zinc-900/95 border-b border-zinc-800 text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded bg-orange-600 text-white font-bold">⚡</span>
        <span class="font-semibold">InstaShare</span>
      </div>
      <nav class="flex items-center gap-6 text-sm">
        <RouterLink to="/marketplace" class="flex items-center gap-1 text-zinc-300 hover:text-white">
          <Store class="w-4 h-4" />
          <span>市场</span>
        </RouterLink>
        <RouterLink to="/orders" class="text-zinc-300 hover:text-white">我的订单</RouterLink>
      </nav>
      <div class="flex items-center gap-2">
        <!-- 复用 Web3Modal 按钮，统一连接体验 -->
        <w3m-button label="连接钱包" balance="hide" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Store } from 'lucide-vue-next'
</script>

<style scoped>
</style>