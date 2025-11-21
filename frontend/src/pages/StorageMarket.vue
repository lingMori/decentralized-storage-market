<template>
  <div style="height: 100vh;">
    <DashboardHeader />
    <div :style="{ position: 'relative', top: `${headerHeight}px` }" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <h1 class="text-2xl font-semibold">存储市场</h1>

    <div class="flex items-center gap-4">
      <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="loadProviders" :disabled="loadingProviders">加载提供商</button>
      <button class="px-3 py-2 bg-green-600 text-white rounded" @click="loadOrders" :disabled="loadingOrders">加载订单</button>
      <span v-if="error" class="text-red-600">{{ error }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border rounded p-4">
        <h2 class="font-medium mb-3">提供商列表</h2>
        <p class="text-sm text-gray-500 mb-2">已加载：{{ providers.length }}</p>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2">ID</th>
              <th class="py-2">地址</th>
              <th class="py-2">可用空间(MB)</th>
              <th class="py-2">单价(wei/MB/月)</th>
              <th class="py-2">质押(wei)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in providers" :key="p.sellID?.toString?.()" class="border-b">
              <td class="py-2">{{ toNum(p.sellID) }}</td>
              <td class="py-2 truncate" :title="p.providerAddress">{{ p.providerAddress }}</td>
              <td class="py-2">{{ toNum(p.availableSpace) }}</td>
              <td class="py-2">{{ toNum(p.pricePerMBPerMonth) }}</td>
              <td class="py-2">{{ toNum(p.stakedETH) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border rounded p-4">
        <h2 class="font-medium mb-3">订单列表</h2>
        <p class="text-sm text-gray-500 mb-2">已加载：{{ orders.length }}</p>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2">ID</th>
              <th class="py-2">购买者</th>
              <th class="py-2">提供商</th>
              <th class="py-2">空间(MB)</th>
              <th class="py-2">总价(wei)</th>
              <th class="py-2">质押(wei)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.orderID?.toString?.()" class="border-b">
              <td class="py-2">{{ toNum(o.orderID) }}</td>
              <td class="py-2 truncate" :title="o.buyerAddress">{{ o.buyerAddress }}</td>
              <td class="py-2 truncate" :title="o.providerAddress">{{ o.providerAddress }}</td>
              <td class="py-2">{{ toNum(o.storageSpace) }}</td>
              <td class="py-2">{{ toNum(o.totalCost) }}</td>
              <td class="py-2">{{ toNum(o.stakedETH) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border rounded p-4">
        <h2 class="font-medium mb-3">查询提供商</h2>
        <div class="flex items-center gap-2 mb-3">
          <input v-model.number="providerId" type="number" placeholder="卖单ID" class="border px-2 py-1 rounded w-32" />
          <button class="px-3 py-1 bg-gray-800 text-white rounded" @click="queryProvider">查询</button>
        </div>
        <div v-if="provider" class="text-sm space-y-1">
          <p>ID：{{ toNum(provider.sellID) }}</p>
          <p>地址：{{ provider.providerAddress }}</p>
          <p>可用空间：{{ toNum(provider.availableSpace) }} MB</p>
          <p>价格：{{ toNum(provider.pricePerMBPerMonth) }} wei/MB/月</p>
          <p>质押：{{ toNum(provider.stakedETH) }} wei</p>
        </div>
        <p v-else class="text-gray-500 text-sm">无数据</p>
      </div>

      <div class="border rounded p-4">
        <h2 class="font-medium mb-3">查询订单</h2>
        <div class="flex items-center gap-2 mb-3">
          <input v-model.number="orderId" type="number" placeholder="订单ID" class="border px-2 py-1 rounded w-32" />
          <button class="px-3 py-1 bg-gray-800 text-white rounded" @click="queryOrder">查询</button>
        </div>
        <div v-if="order" class="text-sm space-y-1">
          <p>ID：{{ toNum(order.orderID) }}</p>
          <p>购买者：{{ order.buyerAddress }}</p>
          <p>提供商：{{ order.providerAddress }}</p>
          <p>空间：{{ toNum(order.storageSpace) }} MB</p>
          <p>总价：{{ toNum(order.totalCost) }} wei</p>
          <p>质押：{{ toNum(order.stakedETH) }} wei</p>
        </div>
        <p v-else class="text-gray-500 text-sm">无数据</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStorageMarketStore } from '@/store/storageMarket'
import { onMounted, ref } from 'vue'
import DashboardHeader from '@/components/storageUI/Header/DashboardHeader.vue'

const headerHeight = ref(0)
const updateHeaderHeight = () => {
  const header = document.querySelector('header')
  if (header) headerHeight.value = (header as HTMLElement).offsetHeight
}

const store = useStorageMarketStore()
const { providers, orders, provider, order, error, loadingProviders, loadingOrders } = storeToRefs(store)

const providerId = ref<number | null>(null)
const orderId = ref<number | null>(null)

function toNum(n: any) {
  try { return typeof n === 'object' && n?._isBigNumber ? Number(n.toString()) : Number(n) } catch { return n }
}

function loadProviders() { store.fetchProviders(100) }
function loadOrders() { store.fetchOrders(100) }

function queryProvider() { if (providerId.value != null) store.fetchProviderById(providerId.value) }
function queryOrder() { if (orderId.value != null) store.fetchOrderById(orderId.value) }

onMounted(() => {
  // 可选择自动加载
  // loadProviders();
  // loadOrders();
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
})
</script>

<style scoped>
.table { width: 100%; }
</style>
