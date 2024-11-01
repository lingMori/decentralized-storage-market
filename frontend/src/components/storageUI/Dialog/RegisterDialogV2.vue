<template>
  <Dialog :open="!isLoggedIn" @update:open="(val) => updateLoginStatus(!val)">
    <DialogContent class="sm:max-w-[600px]">
      <Card class="border-0 shadow-none">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">欢迎来到 InstaShare</CardTitle>
          <CardDescription class="text-center">
            请完成以下步骤开始您的Web3之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Updated Stepper -->
          <Stepper v-model="currentStep" class="mb-8">
            <StepperItem :step="1">
              <StepperTrigger>
                <StepperIndicator>
                  <Wallet class="h-4 w-4" />
                </StepperIndicator>
                <StepperTitle>连接钱包</StepperTitle>
                <StepperDescription>选择您的Web3钱包或社交账号登录</StepperDescription>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>

            <StepperItem :step="2">
              <StepperTrigger>
                <StepperIndicator>
                  <User class="h-4 w-4" />
                </StepperIndicator>
                <StepperTitle>个人信息</StepperTitle>
                <StepperDescription>设置您的个人资料</StepperDescription>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>

            <StepperItem :step="3">
              <StepperTrigger>
                <StepperIndicator>
                  <Shield class="h-4 w-4" />
                </StepperIndicator>
                <StepperTitle>安全验证</StepperTitle>
                <StepperDescription>验证您的身份</StepperDescription>
              </StepperTrigger>
            </StepperItem>
          </Stepper>

          <!-- Step 1: Wallet Connection -->
          <div v-if="currentStep === 1">
            <Tabs default-value="wallet" class="w-full">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">Web3 钱包</TabsTrigger>
                <TabsTrigger value="social">社交账号</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet" class="space-y-4">
                <div class="grid gap-4 mt-4">
                  <Button 
                    class="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
                    @click="handleConnectWallet"
                    :disabled="isLoading"
                  >
                    <Wallet class="mr-2 h-5 w-5" />
                    {{ isLoading ? '连接中...' : '连接 MetaMask' }}
                  </Button>
                  <Button 
                    class="w-full h-12" 
                    variant="outline"
                    :disabled="isLoading"
                  >
                    <Globe class="mr-2 h-5 w-5" />
                    连接 WalletConnect
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="social" class="space-y-4">
                <div class="grid gap-4 mt-4">
                  <Button 
                    v-for="platform in socialPlatforms"
                    :key="platform.id"
                    class="w-full h-12" 
                    variant="outline"
                    @click="() => handleSocialLogin(platform.id)"
                  >
                    <component :is="platform.icon" class="mr-2 h-5 w-5" />
                    {{ platform.name }}登录
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div v-if="registrationError" class="mt-4 text-red-500 text-sm text-center">
            {{ registrationError }}
          </div>
        </CardContent>
      </Card>
    </DialogContent>

    <!-- Drawer for additional steps -->
    <Drawer v-model:open="isDrawerOpen">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {{ stepTitles[currentStep - 1] }}
          </DrawerTitle>
        </DrawerHeader>
        <div class="p-4">
          <!-- Step 2: Personal Information -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div class="space-y-2">
              <Label>用户名</Label>
              <Input
                type="text"
                v-model="userDetails.username"
                placeholder="请输入用户名"
              />
            </div>
            <div class="space-y-2">
              <Label>电子邮箱</Label>
              <Input
                type="email"
                v-model="userDetails.email"
                placeholder="请输入电子邮箱"
              />
            </div>
          </div>

          <!-- Step 3: Security Verification -->
          <div v-if="currentStep === 3" class="space-y-4">
            <p class="text-sm text-gray-600">
              请验证您的邮箱地址，我们已经发送验证码到您的邮箱
            </p>
            <div class="space-y-2">
              <Label>验证码</Label>
              <Input
                type="text"
                v-model="verificationCode"
                placeholder="请输入6位验证码"
                maxlength="6"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-between">
            <Button
              variant="outline"
              @click="handleBack"
              :disabled="currentStep === 1"
            >
              返回
            </Button>
            <Button
              @click="handleNext"
              :disabled="isLoading"
            >
              {{ currentStep === 3 ? '完成' : '下一步' }}
              <ChevronRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import {
  Wallet,
  Mail,
  Github,
  Globe,
  Laptop,
  ChevronRight,
  User,
  Shield
} from 'lucide-vue-next'
import { useWeb3ModalAccount, useWeb3Modal } from '@web3modal/ethers5/vue'
import { useInstaShareContract } from '@/lib/contract-interact/useContract'
import { accountRepo } from '@/lib/contract-interact/accountRepp'
import { useToast } from '@/components/ui/toast'
import router from '@/router'

interface UserDetails {
  username: string
  email: string
  avatar: string | null
}

interface SocialPlatform {
  id: string
  name: string
  icon: any
}

const props = defineProps<{
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  'update:isLoggedIn': [value: boolean]
}>()

// State
const isLoading = ref(false)
const registrationError = ref<string | null>(null)
const currentStep = ref(1) // Start from 1 for stepper
const isDrawerOpen = ref(false)
const verificationCode = ref('')

const userDetails = reactive<UserDetails>({
  username: '',
  email: '',
  avatar: null
})

// Toast and Web3
const { toast } = useToast()
const { isConnected } = useWeb3ModalAccount()
const { open } = useWeb3Modal()
const { getSigner } = useInstaShareContract()
const { register } = accountRepo()

// Step titles for drawer header
const stepTitles = ['连接钱包', '个人信息', '安全验证']

// Social platforms configuration
const socialPlatforms: SocialPlatform[] = [
  { id: 'email', name: '邮箱', icon: Mail },
  { id: 'google', name: 'Google', icon: Globe },
  { id: 'apple', name: 'Apple', icon: Laptop },
  { id: 'github', name: 'Github', icon: Github }
]

// Methods
const updateLoginStatus = (value: boolean) => {
  emit('update:isLoggedIn', value)
}

const handleNext = () => {
  if (currentStep.value < 3) {
    currentStep.value++
    isDrawerOpen.value = true
  } else {
    handleRegister()
  }
}

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleConnectWallet = async () => {
  try {
    isLoading.value = true
    await open()
    
    const connectTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('连接钱包超时')), 30000)
    )

    await Promise.race([
      new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          if (isConnected.value) {
            handleNext()
            clearInterval(timer)
            resolve()
          }
        }, 500)
      }),
      connectTimeout
    ])
  } catch (error) {
    toast({
      title: "钱包连接失败",
      description: error instanceof Error ? error.message : "未知错误",
      variant: "destructive"
    })
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = (platform: string) => {
  toast({
    title: "功能开发中",
    description: `${platform}登录暂未支持`,
    variant: "default"
  })
  handleNext()
}

const handleRegister = async () => {
  registrationError.value = null
  isLoading.value = true
  
  try {
    const signer = getSigner()
    const address = await signer.getAddress()

    if (!address) {
      throw new Error('无法获取钱包地址')
    }

    // 验证表单
    if (!userDetails.username || !userDetails.email || !verificationCode.value) {
      throw new Error('请填写所有必填信息')
    }

    const response = await register()

    if (response && response.success) {
      toast({
        title: "注册成功",
        description: "欢迎加入InstaShare网络！",
        variant: "default"
      })
      updateLoginStatus(true)
      router.push('/dashboard/upload')
    } else {
      throw new Error(response?.error || '注册失败')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    registrationError.value = errorMessage
    toast({
      title: "注册失败",
      description: errorMessage,
      variant: "destructive"
    })
  } finally {
    isLoading.value = false
    isDrawerOpen.value = false
  }
}
</script>