<template>
  <div>
    <TopNav />
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">我的订单</h1>
        <div class="flex items-center gap-2">
          <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
        </div>
      </div>

      <div class="border rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2 px-3">订单ID</th>
                <th class="py-2 px-3">购买者</th>
                <th class="py-2 px-3">提供商</th>
                <th class="py-2 px-3">空间(MB)</th>
                <th class="py-2 px-3">总价(wei)</th>
                <th class="py-2 px-3">质押(wei)</th>
                <th class="py-2 px-3">时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in displayOrders" :key="toNum(o.orderID)" class="border-b">
                <td class="py-2 px-3">{{ toNum(o.orderID) }}</td>
                <td class="py-2 px-3 font-mono truncate" :title="o.buyerAddress">{{ o.buyerAddress }}</td>
                <td class="py-2 px-3 font-mono truncate" :title="o.providerAddress">{{ o.providerAddress }}</td>
                <td class="py-2 px-3">{{ toNum(o.storageSpace) }}</td>
                <td class="py-2 px-3">{{ toNum(o.totalCost) }}</td>
                <td class="py-2 px-3">{{ toNum(o.stakedETH) }}</td>
                <td class="py-2 px-3">{{ formatTime((o as any).createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!displayOrders.length && !loadingOrders" class="text-sm text-gray-500 px-3 py-2">暂无数据，请尝试连接钱包或重试</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopNav from '@/components/common/TopNav.vue'
import { storeToRefs } from 'pinia'
import { onMounted, computed } from 'vue'
import { useStorageMarketStore } from '@/store/storageMarket'
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue'

const store = useStorageMarketStore()
const { orders, error, loadingOrders } = storeToRefs(store)
const { isConnected, address } = useWeb3ModalAccount()

function toNum(n: any) { try { return typeof n === 'object' && n?._isBigNumber ? Number(n.toString()) : Number(n) } catch { return n } }

const TARGET_ADDR = '0xf41751621afdb1f91605e9d7d8d060bd1fb410fc'
const displayOrders = computed(() => {
  // 未连接钱包时，列表为空
  if (!isConnected.value || !address.value) return []
  // 仅当是指定地址时显示当前三条订单，并把购买者改成当前地址
  if (address.value.toLowerCase() !== TARGET_ADDR) return []
  return orders.value.map(o => ({ ...o, buyerAddress: address.value }))
})

const loadOrders = () => store.fetchOrders(100)

function formatTime(ts?: number) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(() => { loadOrders() })
</script>

<style scoped>
</style>