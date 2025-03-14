<template>
  <Dialog :open="isOpen" @update:open="val => updateDialogStatus(val)" class="max-h-[90vh] overflow-y-auto w-[1200px]">
    <DialogContent v-on:interact-outside="(e: Event) => { e.preventDefault(); }" class="max-h-[90vh] overflow-y-auto max-w-fit">
      <Card class="border-0 shadow-none w-[1000px]">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-3xl font-bold">存储资源市场</CardTitle>
              <CardDescription class="text-lg mt-2">
                选择并购买您需要的存储空间
              </CardDescription>
            </div>
            <div class="flex items-center gap-4">
              <Button variant="outline" @click="refreshData" :disabled="isLoading">
                <RefreshCcwIcon class="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Select v-model="sortBy">
                <SelectTrigger class="w-40">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">价格从低到高</SelectItem>
                  <SelectItem value="price-desc">价格从高到低</SelectItem>
                  <SelectItem value="space-asc">空间从小到大</SelectItem>
                  <SelectItem value="space-desc">空间从大到小</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="grid" class="w-full">
            <TabsList class="mb-4">
              <TabsTrigger value="grid">
                <LayoutGridIcon class="w-4 h-4 mr-2" />
                网格视图
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListIcon class="w-4 h-4 mr-2" />
                列表视图
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card v-for="provider in sortedProviders" 
                      :key="provider.sellID" 
                      class="hover:bg-accent/5 transition-colors cursor-pointer"
                      @click="openPurchaseDialog(provider)">
                  <CardContent class="p-6">
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <Badge variant="outline">节点 #{{ provider.sellID }}</Badge>
                        <Badge :variant="getReputationVariant(provider.reputation)">
                          {{ getReputationLabel(provider.reputation) }}
                        </Badge>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <ServerIcon class="h-5 w-5 text-muted-foreground" />
                          <div class="font-medium truncate">{{ shortenAddress(provider.providerAddress) }}</div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                          <HardDriveIcon class="h-5 w-5 text-muted-foreground" />
                          <div class="font-medium">{{ provider.availableSpace }} MB 可用空间</div>
                        </div>

                        <div class="flex items-center gap-2">
                          <CoinsIcon class="h-5 w-5 text-muted-foreground" />
                          <div class="font-medium">{{ formatPrice(provider.stakedETH) }} ETH 质押</div>
                        </div>
                      </div>

                      <Separator />

                      <div class="flex items-center justify-between">
                        <div class="text-sm text-muted-foreground">每月价格</div>
                        <div class="text-lg font-bold">
                          {{ formatPrice(provider.pricePerMBPerMonth) }} ETH/MB
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <Progress :value="provider.uptime" class="flex-1" />
                        <span class="text-sm text-muted-foreground">
                          在线率 {{ provider.uptime }}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="list">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>节点ID</TableHead>
                    <TableHead>提供商地址</TableHead>
                    <TableHead>可用空间</TableHead>
                    <TableHead>每月价格</TableHead>
                    <TableHead>质押金额</TableHead>
                    <TableHead>在线率</TableHead>
                    <TableHead>信誉等级</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="provider in sortedProviders" :key="provider.sellID">
                    <TableCell>{{ provider.sellID }}</TableCell>
                    <TableCell class="font-mono">{{ shortenAddress(provider.providerAddress)}}</TableCell>
                    <TableCell>{{ provider.availableSpace }} MB</TableCell>
                    <TableCell>{{ formatPrice(provider.pricePerMBPerMonth) }} ETH/MB</TableCell>
                    <TableCell>{{ formatPrice(provider.stakedETH) }} ETH</TableCell>
                    <TableCell>{{ provider.uptime }}%</TableCell>
                    <TableCell>
                      <Badge :variant="getReputationVariant(provider.reputation)">
                        {{ getReputationLabel(provider.reputation) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" @click="openPurchaseDialog(provider)">
                        购买
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>

  <!-- 购买确认对话框 -->
  <Dialog :open="isPurchaseDialogOpen" @update:open="val => updatePurchaseDialogStatus(val)" class="w-[800px]">
    <DialogContent v-if="selectedProvider">
      <Card class="w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle class="text-2xl font-bold">购买存储空间</CardTitle>
          <CardDescription>
            请填写购买信息并确认
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div class="grid gap-4 p-4 bg-accent/5 rounded-lg">
              <div class="space-y-2">
                <h4 class="font-medium">提供商信息</h4>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">节点ID:</span>
                  <span class="font-medium">{{ selectedProvider.sellID }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">提供商地址:</span>
                  <span class="font-mono">{{ shortenAddress(selectedProvider.providerAddress) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">信誉等级:</span>
                  <Badge :variant="getReputationVariant(selectedProvider.reputation)">
                    {{ getReputationLabel(selectedProvider.reputation) }}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div class="space-y-4">
                <h4 class="font-medium">存储配置</h4>
                
                <div class="space-y-2">
                  <Label>购买空间</Label>
                  <div class="flex gap-4">
                    <Input
                      v-model="selectedProvider.availableSpace"
                      type="number"
                      class="flex-2"
                      :disabled=true
                    />
                    <Select v-model="purchaseUnit" class="w-32" :disabled="purchaseUnit !== ''">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label>存储时长</Label>
                  <Select v-model="purchaseDuration">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1个月</SelectItem>
                      <SelectItem value='3'>3个月</SelectItem>
                      <SelectItem value='6'>6个月</SelectItem>
                      <SelectItem value='12'>12个月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div class="space-y-2">
                <h4 class="font-medium">费用明细</h4>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">单价:</span>
                    <span>{{ formatEther(selectedProvider.pricePerMBPerMonth) }} ETH/MB/月</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">空间:</span>
                    <span>{{ purchaseAmount }} {{ purchaseUnit }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">时长:</span>
                    <span>{{ purchaseDuration }} 个月</span>
                  </div>
                  <Separator />
                  <div class="flex items-center justify-between pt-2">
                    <span class="font-medium">总计:</span>
                    <span class="text-xl font-bold">
                      {{ calculateTotalCost() }} ETH
                    </span>
                  </div>
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
                :disabled="isLoading || !isPurchaseValid" 
                @click="handlePurchase"
              >
                <Loader2Icon v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
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
import { ref, computed, onMounted } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { 
  ServerIcon, 
  HardDriveIcon, 
  CoinsIcon,
  RefreshCcwIcon,
  LayoutGridIcon,
  ListIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import StorageMarketABI from '../../../../../contract/data-market/abi/StorageMarket.json'
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient'
import { findProviders } from '@/lib/contract-interact/graphSQL/temp/findProviders'
import { SUBGRAPH_API_StorageMarketOrder } from '@/configs/SUBGRAPH_API'

// 类型定义
interface StorageProvider {
  sellID: number
  providerAddress: string
  availableSpace: number
  pricePerMBPerMonth: ethers.BigNumber
  stakedETH: ethers.BigNumber
  uptime: number
  reputation: number
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
const sortBy = ref('price-asc')
const purchaseAmount = ref(1)
const purchaseUnit = ref('MB')
const purchaseDuration = ref('1')
const { toast } = useToast()

// 合约相关配置
const contractAddress = '0xe76DE1e72C90C92DbCcf2A2ab2De0a244C987f8a'
const contractABI = StorageMarketABI

const fetchAllDataProviders = async():Promise<StorageProvider[]> => {
  const client = createGraphqlClient(SUBGRAPH_API_StorageMarketOrder, findProviders());
  const response = await client as { storageProviders:StorageProvider[] };
  // console.log(response.storageProviders);
  return response.storageProviders;
}

// 计算属性
const sortedProviders = computed(() => {
  const sorted = [...providers.value]
  switch (sortBy.value) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = ethers.BigNumber.from(a.pricePerMBPerMonth)
        const priceB = ethers.BigNumber.from(b.pricePerMBPerMonth)
        return priceA.lt(priceB) ? -1 : 1
      })
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = ethers.BigNumber.from(a.pricePerMBPerMonth)
        const priceB = ethers.BigNumber.from(b.pricePerMBPerMonth)
        return priceA.gt(priceB) ? -1 : 1
      })
    case 'space-asc':
      return sorted.sort((a, b) => a.availableSpace - b.availableSpace)
    case 'space-desc':
      return sorted.sort((a, b) => b.availableSpace - a.availableSpace)
    default:
      return sorted
  }
})

const isPurchaseValid = computed(() => {
  if (!selectedProvider.value) return false
  if (purchaseAmount.value <= 0) return false
  if (purchaseUnit.value === 'GB' && purchaseAmount.value * 1024 > selectedProvider.value.availableSpace) return false
  if (purchaseUnit.value === 'MB' && purchaseAmount.value > selectedProvider.value.availableSpace) return false
  return true
})

// 工具函数
function getReputationVariant(reputation: number): "offline" | "default" | "secondary" | "outline" | "destructive" | "pending" | "processing" | "completed" | "failed" | "online" | "away" | "busy" | null | undefined {
  if (reputation >= 90) return 'default'
  if (reputation >= 70) return 'secondary'
  if (reputation >= 50) return 'outline'
  return 'destructive'
}

function getReputationLabel(reputation: number): string {
  if (reputation >= 90) return '优质节点'
  if (reputation >= 70) return '良好节点'
  if (reputation >= 50) return '一般节点'
  return '风险节点'
}

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
    purchaseAmount.value = 1
    purchaseUnit.value = 'MB'
    purchaseDuration.value = '1'
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

// 刷新数据
const refreshData = async (): Promise<void> => {
  isLoading.value = true
  try {
    await fetchProviders()
    toast({
      title: "刷新成功",
      description: "数据已更新",
      variant: "default"
    })
  } catch (err) {
    toast({
      title: "刷新失败",
      description: err instanceof Error ? err.message : "未知错误",
      variant: "destructive"
    })
  } finally {
    isLoading.value = false
  }
}
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
    providers.value = await fetchAllDataProviders()
    
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

function shortenAddress(address: string): string {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
}

function formatPrice(value: ethers.BigNumber, decimals: number = 4): string {
  const formattedValue = ethers.utils.formatEther(value);
  return parseFloat(formattedValue).toFixed(decimals);
}

// 格式化ETH显示
function formatEther(value: ethers.BigNumber): string {
  return ethers.utils.formatEther(value)
}

// 计算总成本
function calculateTotalCost(): string {
  if (!selectedProvider.value) return '0'
  
  let totalMB = selectedProvider.value.availableSpace
  if (purchaseUnit.value === 'GB') {
    totalMB *= 1024
  }
  
  const monthlyRate = ethers.BigNumber.from(selectedProvider.value.pricePerMBPerMonth)
  const total = monthlyRate.mul(totalMB).mul(purchaseDuration.value)
  return formatEther(total)
}

// 处理购买
async function handlePurchase(): Promise<void> {
  if (!selectedProvider.value || !isPurchaseValid.value) return

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

    // 计算购买空间（转换为MB）
    const spaceMB = purchaseUnit.value === 'GB' ? purchaseAmount.value * 1024 : purchaseAmount.value

    // 计算支付金额
    const totalCost = ethers.BigNumber.from(selectedProvider.value.pricePerMBPerMonth)
      .mul(spaceMB)
      .mul(purchaseDuration.value)

    // 创建订单
    const tx = await contract.createDataOrder(
      selectedProvider.value.sellID,
      spaceMB,
      purchaseDuration.value,
      { value: totalCost }
    )
    await tx.wait()

    // 成功提示
    toast({
      title: "购买成功",
      description: `您已成功购买 ${purchaseAmount.value}${purchaseUnit.value} 存储空间，时长 ${purchaseDuration.value} 个月！`,
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


onMounted(async() => {
  // await fetchAllDataProviders()
  await fetchProviders()
})
</script>
