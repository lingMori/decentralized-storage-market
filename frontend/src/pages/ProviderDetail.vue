<template>
  <div>
    <TopNav />
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="back">返回</button>
          <h1 class="text-2xl font-semibold">提供商详情</h1>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" @click="openDialog">立即购买</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <h2 class="font-medium mb-3">链上信息</h2>
          <div v-if="provider" class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">节点ID</span>
              <span class="font-mono">#{{ toNum(provider.sellID) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">地址</span>
              <span class="font-mono truncate" :title="provider.providerAddress">{{ provider.providerAddress }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">可用空间</span>
              <span class="font-medium">{{ toNum(provider.availableSpace) }} MB</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">单价</span>
              <span class="font-medium">{{ toNum(provider.pricePerMBPerMonth) }} wei/MB/月</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">质押金额</span>
              <span class="font-medium">{{ toNum(provider.stakedETH) }} wei</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">状态</span>
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">{{ provider.status || 'ACTIVE' }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">未加载，请上方点击“立即购买”或自动查询</p>
        </div>

        <div class="border rounded-lg p-4">
          <h2 class="font-medium mb-3">购买配置</h2>
          <div class="space-y-3 text-sm">
            <div>
              <label class="text-gray-600">购买空间(MB)</label>
              <input v-model.number="spaceMB" type="number" class="w-full border rounded px-2 py-1" placeholder="例如 100" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">预计总价</span>
              <span class="font-medium">{{ totalCostWei }} wei</span>
            </div>
            <p class="text-xs text-gray-500">实际支付允许 ±5% 浮动（滑点保护）</p>
          </div>
        </div>
      </div>

      <BuyStorageDialog :open="dialogOpen" :sellID="sellIDNum" :spaceMB="spaceMB" :totalCostWei="totalCostWei" @update:open="v => (dialogOpen = v)" @confirm="confirmBuy" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TopNav from '@/components/common/TopNav.vue'
import BuyStorageDialog from '@/components/dialog/BuyStorageDialog.vue'
import { useStorageMarketStore } from '@/store/storageMarket'

const route = useRoute()
const router = useRouter()
const sellID = route.params.sellID
const sellIDNum = Number(sellID)

const store = useStorageMarketStore()
const { provider } = storeToRefs(store)

const spaceMB = ref<number>(100)
const dialogOpen = ref(false)

function toNum(n: any) { try { return typeof n === 'object' && n?._isBigNumber ? Number(n.toString()) : Number(n) } catch { return n } }

const unitPrice = computed(() => toNum(provider.value?.pricePerMBPerMonth ?? 0))
const totalCostWei = computed(() => unitPrice.value * (spaceMB.value || 0))

const back = () => router.push('/marketplace')
const openDialog = () => { dialogOpen.value = true; if (!provider.value) store.fetchProviderById(sellIDNum) }
const confirmBuy = () => { dialogOpen.value = false /* 仅展示，交易逻辑后续接入 */ }

onMounted(() => { if (!Number.isNaN(sellIDNum)) store.fetchProviderById(sellIDNum) })
</script>

<style scoped>
</style>