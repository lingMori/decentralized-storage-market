import { ethers } from 'ethers'
import StorageMarketABI from '../../../../contract/data-market/abi/StorageMarket.json'
import { contractAddress_StorageMarket } from '@/configs/CONTRACT_ADDRESS'

export interface StorageProviderInfo {
  sellID: ethers.BigNumber
  providerAddress: string
  availableSpace: ethers.BigNumber
  pricePerMBPerMonth: ethers.BigNumber
  stakedETH: ethers.BigNumber
  isValid?: boolean
}

export interface DataOrderInfo {
  orderID: ethers.BigNumber
  providerAddress: string
  buyerAddress: string
  storageSpace: ethers.BigNumber
  totalCost: ethers.BigNumber
  stakedETH: ethers.BigNumber
  verificationContract: string
}

function getReadProvider(): ethers.providers.Web3Provider {
  if (!(window as any).ethereum) {
    throw new Error('未检测到 Ethereum 钱包，请安装或打开 MetaMask')
  }
  return new ethers.providers.Web3Provider((window as any).ethereum)
}

function getContract(): ethers.Contract {
  // 避免类型问题：将导入的地址安全归一化为字符串
  const rawAddr: unknown = contractAddress_StorageMarket as unknown
  const address = typeof rawAddr === 'string' ? rawAddr.trim() : ''

  if (!address) {
    throw new Error('StorageMarket 合约地址未配置，请在 configs/CONTRACT_ADDRESS.ts 中设置')
  }
  const provider = getReadProvider()
  return new ethers.Contract(address, StorageMarketABI, provider)
}

export async function getProviderInfo(sellID: number): Promise<StorageProviderInfo> {
  const c = getContract()
  const r = await c.getProviderInfo(sellID)
  const [sid, addr, space, price, stake, valid] = r as [
    ethers.BigNumber, string, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, boolean
  ]
  return {
    sellID: sid,
    providerAddress: addr,
    availableSpace: space,
    pricePerMBPerMonth: price,
    stakedETH: stake,
    isValid: valid,
  }
}

export async function getOrderInfo(orderID: number): Promise<DataOrderInfo> {
  const c = getContract()
  const r = await c.getOrderInfo(orderID)
  const [oid, pAddr, bAddr, space, total, stake, verifier] = r as [
    ethers.BigNumber, string, string, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, string
  ]
  return {
    orderID: oid,
    providerAddress: pAddr,
    buyerAddress: bAddr,
    storageSpace: space,
    totalCost: total,
    stakedETH: stake,
    verificationContract: verifier,
  }
}

export async function tryListProviders(maxCheck = 100): Promise<StorageProviderInfo[]> {
  const c = getContract()
  try {
    const ids: ethers.BigNumber[] = await c.getValidProviderSellIDs()
    const sellIDs = ids.map((x) => Number(x.toString())).slice(0, maxCheck)
    const providers = await Promise.all(sellIDs.map((id) => c.getProviderInfo(id)))
    return providers.map((r: any) => {
      const [sid, addr, space, price, stake, valid] = r
      return {
        sellID: sid,
        providerAddress: addr,
        availableSpace: space,
        pricePerMBPerMonth: price,
        stakedETH: stake,
        isValid: valid,
      } as StorageProviderInfo
    })
  } catch (e) {
    // 兼容旧版本：回退扫描
    const nextSID: ethers.BigNumber = await c.nextSellID().catch(() => ethers.BigNumber.from(maxCheck))
    const limit = Math.min(Number(nextSID.toString()), maxCheck)
    const result: StorageProviderInfo[] = []
    for (let i = 0; i < limit; i++) {
      try {
        const r = await c.storageProviders(i)
        const [sid, addr, space, price, stake, valid] = r as [
          ethers.BigNumber, string, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, boolean
        ]
        if (addr && addr !== ethers.constants.AddressZero && valid) {
          result.push({ sellID: sid, providerAddress: addr, availableSpace: space, pricePerMBPerMonth: price, stakedETH: stake, isValid: valid })
        }
      } catch {}
    }
    return result
  }
}

export async function tryListOrders(maxCheck = 100): Promise<DataOrderInfo[]> {
  const c = getContract()
  const nextOID: ethers.BigNumber = await c.nextOrderID().catch(() => ethers.BigNumber.from(maxCheck))
  const limit = Math.min(Number(nextOID.toString()), maxCheck)
  const result: DataOrderInfo[] = []
  for (let i = 0; i < limit; i++) {
    try {
      const r = await c.dataOrders(i)
      const [oid, pAddr, bAddr, space, total, stake, verifier] = r as [
        ethers.BigNumber, string, string, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, string
      ]
      if (pAddr && pAddr !== ethers.constants.AddressZero) {
        result.push({ orderID: oid, providerAddress: pAddr, buyerAddress: bAddr, storageSpace: space, totalCost: total, stakedETH: stake, verificationContract: verifier })
      }
    } catch {}
  }
  return result
}