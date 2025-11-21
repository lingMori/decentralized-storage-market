<template>
  <div style="height: 100vh;">
    <DashboardHeader />
    <div :style="{ position: 'relative', top: `${headerHeight}px` }" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">存储市场</h1>
      </div>

      <div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProviderCard v-for="p in filteredProviders" :key="toNum(p.sellID)" :provider="p" @view="goDetail" />
        </div>
        <p v-if="!providers.length && !loadingProviders" class="text-sm text-gray-500">暂无数据，已显示演示数据或请稍后重试</p>
      </div>

      <div class="mt-6 space-y-4">
        <div>
          <label class="text-sm text-gray-600">最小空间(MB)：<span class="font-medium">{{ minSpace }}</span></label>
          <input type="range" v-model.number="minSpace" min="0" max="50000" step="100" class="w-full" />
        </div>
        <div>
          <label class="text-sm text-gray-600">最高单价(wei/MB/月)：<span class="font-medium">{{ maxPrice }}</span></label>
          <input type="range" v-model.number="maxPrice" min="0" max="100000" step="100" class="w-full" />
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="resetFilters">重置筛选</button>
          <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import DashboardHeader from '@/components/storageUI/Header/DashboardHeader.vue'
import ProviderCard from '@/components/market/ProviderCard.vue'
import { useStorageMarketStore } from '@/store/storageMarket'

const store = useStorageMarketStore()
const { providers, error, loadingProviders } = storeToRefs(store)

const minSpace = ref<number>(0)
const maxPrice = ref<number>(100000)

function toNum(n: any) {
  try { return typeof n === 'object' && n?._isBigNumber ? Number(n.toString()) : Number(n) } catch { return n }
}

const filteredProviders = computed(() => {
  return providers.value.filter(p => {
    const spaceOk = minSpace.value == null ? true : toNum(p.availableSpace) >= minSpace.value
    const priceOk = maxPrice.value == null ? true : toNum(p.pricePerMBPerMonth) <= maxPrice.value
    return spaceOk && priceOk
  })
})

const loadProviders = () => store.fetchProviders(100)
const resetFilters = () => { minSpace.value = null; maxPrice.value = null }

const router = useRouter()
const goDetail = (sellID: number) => router.push(`/provider/${sellID}`)

onMounted(() => {
  // 自动加载（当合约地址未配置时会自动回退至演示数据）
  loadProviders()
})

const headerHeight = ref(0)
const updateHeaderHeight = () => {
  const header = document.querySelector('header')
  if (header) headerHeight.value = (header as HTMLElement).offsetHeight
}
onMounted(() => {
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
})
</script>

<style scoped>
</style>
