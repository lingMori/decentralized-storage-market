<template>
  <Dialog :open="isOpen" @update:open="val => updateDialogStatus(val)">
    <DialogContent v-on:interact-outside="(e: Event) => { e.preventDefault(); }">
      <Card class="w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">存储资源市场</CardTitle>
          <CardDescription class="text-center">
            选择并购买您需要的存储空间
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- 存储资源列表 -->
          <div class="grid gap-4">
            <Card v-for="provider in providers" 
                  :key="provider.sellID" 
                  class="w-full hover:bg-accent transition-colors cursor-pointer"
                  @click="openPurchaseDialog(provider)">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <ServerIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div class="font-medium">存储提供商 #{{ provider.sellID }}</div>
                      <div class="text-sm text-muted-foreground truncate">{{ provider.providerAddress }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium">{{ provider.availableSpace }} MB</div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatEther(provider.pricePerMBPerMonth) }} ETH/MB
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>

  <!-- 购买确认对话框 -->
  <Dialog :open="isPurchaseDialogOpen" @update:open="val => updatePurchaseDialogStatus(val)">
    <DialogContent v-if="selectedProvider">
      <Card class="w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle class="text-xl font-bold">确认购买</CardTitle>
          <CardDescription>
            请确认以下存储空间购买信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="grid gap-4">
              <div class="space-y-2">
                <h4 class="font-medium">提供商信息</h4>
                <div class="text-sm text-muted-foreground">
                  ID: {{ selectedProvider.sellID }}
                </div>
                <div class="text-sm text-muted-foreground">
                  地址: {{ selectedProvider.providerAddress }}
                </div>
              </div>

              <div class="space-y-2">
                <h4 class="font-medium">存储详情</h4>
                <div class="text-sm text-muted-foreground">
                  可用空间: {{ selectedProvider.availableSpace }} MB
                </div>
                <div class="text-sm text-muted-foreground">
                  每月价格: {{ formatEther(selectedProvider.pricePerMBPerMonth) }} ETH/MB
                </div>
              </div>

              <div class="space-y-2">
                <h4 class="font-medium">总价</h4>
                <div class="text-lg font-bold">
                  {{ calculateTotalCost(selectedProvider) }} ETH
                </div>
              </div>
            </div>

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <div class="flex justify-end gap-4">
              <Button variant="outline" @click="closePurchaseDialog">
                取消
              </Button>
              <Button 
                :disabled="isLoading" 
                @click="handlePurchase"
              >
                {{ isLoading ? '处理中...' : '确认购买' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ServerIcon } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import StorageMarketABI from '../../../../../contract/data-market/abi/StorageMarket.json'

// 类型定义
interface StorageProvider {
  sellID: number
  providerAddress: string
  availableSpace: number
  pricePerMBPerMonth: ethers.BigNumber
  stakedETH: ethers.BigNumber
}

interface Props {
  isOpen: boolean
}

// Props 和 Emits 定义
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

// 状态管理
const providers = ref<StorageProvider[]>([])
const selectedProvider = ref<StorageProvider | null>(null)
const isPurchaseDialogOpen = ref(false)
const isLoading = ref(false)
const error = ref('')
const { toast } = useToast()

// 合约相关配置
const contractAddress = '0x0e9C8F895dc31c2b7E85ccA14252Fd3F02dB7B50'
const contractABI = StorageMarketABI // 这里需要填入你的合约ABI

// 主 Dialog 控制
const updateDialogStatus = (value: boolean): void => {
  emit('update:isOpen', value)
}

// 购买 Dialog 控制
const updatePurchaseDialogStatus = (value: boolean): void => {
  isPurchaseDialogOpen.value = value
  if (!value) {
    selectedProvider.value = null
    error.value = ''
  }
}

// 打开购买对话框
const openPurchaseDialog = (provider: StorageProvider): void => {
  selectedProvider.value = provider
  isPurchaseDialogOpen.value = true
}

// 关闭购买对话框
const closePurchaseDialog = (): void => {
  updatePurchaseDialogStatus(false)
}

// 初始化
onMounted(async (): Promise<void> => {
  await fetchProviders()
})

// 获取存储提供商列表
async function fetchProviders(): Promise<void> {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask未安装')
    }

    // 连接到以太坊
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, contractABI, provider)

    // 模拟数据 - 实际使用时替换为合约调用
    providers.value = [
      {
        sellID: 1,
        providerAddress: "0x123...abc",
        availableSpace: 1000,
        pricePerMBPerMonth: ethers.utils.parseEther("0.001"),
        stakedETH: ethers.utils.parseEther("1.0")
      },
      {
        sellID: 2,
        providerAddress: "0x456...def",
        availableSpace: 2000,
        pricePerMBPerMonth: ethers.utils.parseEther("0.0015"),
        stakedETH: ethers.utils.parseEther("2.0")
      }
    ]
  } catch (err) {
    error.value = "获取提供商列表失败"
    toast({
      title: "获取失败",
      description: err instanceof Error ? err.message : "未知错误",
      variant: "destructive"
    })
    console.error(err)
  }
}

// 计算总成本
function calculateTotalCost(provider: StorageProvider | null): string {
  if (!provider) return '0'
  const total = ethers.BigNumber.from(provider.pricePerMBPerMonth)
    .mul(provider.availableSpace)
  return formatEther(total)
}

// 格式化ETH显示
function formatEther(value: ethers.BigNumber): string {
  return ethers.utils.formatEther(value)
}

// 处理购买
async function handlePurchase(): Promise<void> {
  if (!selectedProvider.value) return

  try {
    isLoading.value = true
    error.value = ''

    if (!window.ethereum) {
      throw new Error('MetaMask未安装')
    }

    // 连接到以太坊
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    // 计算支付金额
    const totalCost = ethers.BigNumber.from(selectedProvider.value.pricePerMBPerMonth)
      .mul(selectedProvider.value.availableSpace)

    // 创建订单
    const tx = await contract.createDataOrder(selectedProvider.value.sellID, {
      value: totalCost
    })
    await tx.wait()

    // 成功提示
    toast({
      title: "购买成功",
      description: "您的存储空间已购买成功！",
      variant: "default"
    })

    // 关闭对话框并刷新数据
    closePurchaseDialog()
    await fetchProviders()
  } catch (err) {
    error.value = err instanceof Error ? err.message : "购买失败"
    toast({
      title: "购买失败",
      description: err instanceof Error ? err.message : "未知错误",
      variant: "destructive"
    })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>
