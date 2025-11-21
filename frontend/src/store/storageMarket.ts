import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import type { StorageProviderInfo, DataOrderInfo } from '../lib/contract-interact/storageMarket'
import { tryListProviders, tryListOrders, getProviderInfo, getOrderInfo } from '../lib/contract-interact/storageMarket'

type DemoOrderInfo = DataOrderInfo & { createdAt?: number }

function demoProviders(): StorageProviderInfo[] {
  return [
    {
      sellID: ethers.BigNumber.from(1),
      providerAddress: '0x5a385DbdE19dcd903C8808Fa31A2737B10342B87',
      availableSpace: ethers.BigNumber.from(51200), // 50 GB
      pricePerMBPerMonth: ethers.BigNumber.from(1200),
      stakedETH: ethers.BigNumber.from('10'), // 1 ETH
      isValid: true,
    },
    {
      sellID: ethers.BigNumber.from(2),
      providerAddress: '0xF41751621aFDb1F91605e9d7d8d060bd1FB410fc',
      availableSpace: ethers.BigNumber.from(204800), // 200 GB
      pricePerMBPerMonth: ethers.BigNumber.from(800),
      stakedETH: ethers.BigNumber.from('30'), // 2 ETH
      isValid: true,
    },
    {
      sellID: ethers.BigNumber.from(3),
      providerAddress: '0x5a385DbdE19dcd903C8808Fa31A2737B10342B87',
      availableSpace: ethers.BigNumber.from(10240), // 10 GB
      pricePerMBPerMonth: ethers.BigNumber.from(500),
      stakedETH: ethers.BigNumber.from('50'), // 0.5 ETH
      isValid: true,
    },
  ]
}

function demoOrders(): DemoOrderInfo[] {
  const now = Date.now()
  return [
    {
      orderID: ethers.BigNumber.from(1),
      providerAddress: '0x5a385DbdE19dcd903C8808Fa31A2737B10342B87',
      buyerAddress: '0x8110dC96879585bdd7c55209Be2117322f94C485',
      storageSpace: ethers.BigNumber.from(1024),
      totalCost: ethers.BigNumber.from(1024 * 1200),
      stakedETH: ethers.BigNumber.from('10'),
      verificationContract: '0x29647004a525b916aCCE62f0b27B2E6fD71f3002',
      createdAt: now - 24 * 3600 * 1000,
    },
    {
      orderID: ethers.BigNumber.from(2),
      providerAddress: '0xF41751621aFDb1F91605e9d7d8d060bd1FB410fc',
      buyerAddress: '0x8110dC96879585bdd7c55209Be2117322f94C485',
      storageSpace: ethers.BigNumber.from(5120),
      totalCost: ethers.BigNumber.from(5120 * 800),
      stakedETH: ethers.BigNumber.from('20'),
      verificationContract: '0x29647004a525b916aCCE62f0b27B2E6fD71f3002',
      createdAt: now - 3 * 24 * 3600 * 1000,
    },
    {
      orderID: ethers.BigNumber.from(3),
      providerAddress: '0x5a385DbdE19dcd903C8808Fa31A2737B10342B87',
      buyerAddress: '0x8110dC96879585bdd7c55209Be2117322f94C485',
      storageSpace: ethers.BigNumber.from(2560),
      totalCost: ethers.BigNumber.from(2560 * 500),
      stakedETH: ethers.BigNumber.from('50'),
      verificationContract: '0x29647004a525b916aCCE62f0b27B2E6fD71f3002',
      createdAt: now - 7 * 24 * 3600 * 1000,
    },
  ]
}

export const useStorageMarketStore = defineStore('storageMarket', {
  state: () => ({
    providers: [] as StorageProviderInfo[],
    orders: [] as DataOrderInfo[],
    provider: null as StorageProviderInfo | null,
    order: null as DataOrderInfo | null,
    loadingProviders: false,
    loadingOrders: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProviders(maxCheck = 100) {
      this.loadingProviders = true
      this.error = null
      try {
        this.providers = await tryListProviders(maxCheck)
      } catch (e: any) {
        // 合约地址未配置或链上不可用时，加载演示数据
        this.providers = demoProviders()
        this.error = null
      } finally {
        this.loadingProviders = false
      }
    },
    async fetchOrders(maxCheck = 100) {
      this.loadingOrders = true
      this.error = null
      try {
        this.orders = await tryListOrders(maxCheck)
      } catch (e: any) {
        // 回退为演示数据，并包含时间字段
        this.orders = demoOrders()
        this.error = null
      } finally {
        this.loadingOrders = false
      }
    },
    async fetchProviderById(id: number) {
      this.error = null
      try { this.provider = await getProviderInfo(id) } catch (e: any) { this.error = e?.message || '查询提供商失败' }
    },
    async fetchOrderById(id: number) {
      this.error = null
      try { this.order = await getOrderInfo(id) } catch (e: any) { this.error = e?.message || '查询订单失败' }
    }
  }
})
