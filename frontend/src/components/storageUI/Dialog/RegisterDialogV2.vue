<template>
  <div class="min-h-screen flex">
    <div class="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <!-- Left Column - Brand Section -->
      <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div class="absolute inset-0 bg-zinc-900" />
        <div class="relative z-20 flex items-center text-lg font-medium">
          <Wallet class="mr-2 h-6 w-6" />
          InstaShare
        </div>
        <div class="relative z-20 mt-auto">
          <blockquote class="space-y-2">
            <p class="text-lg">
              &ldquo;加入Web3社区，探索去中心化存储的无限可能。在这里，您的数据由您掌控，安全且永久存储。&rdquo;
            </p>
            <footer class="text-sm">InstaShare 团队</footer>
          </blockquote>
        </div>
      </div>

      <!-- Right Column - Registration Form -->
      <div class="h-full lg:p-8 flex items-center">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div class="flex flex-col space-y-2 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">
              开始您的 Web3 之旅
            </h1>
            <p class="text-sm text-muted-foreground">
              请完成以下步骤以创建您的账户
            </p>
          </div>

          <Card class="border-0 shadow-none">
            <CardContent class="space-y-6">
              <!-- Rest of the content remains the same -->
              <!-- Stepper -->
              <Stepper v-model="currentStep" class="mb-8">
                <StepperItem :step="1">
                  <StepperTrigger>
                    <StepperIndicator>
                      <Wallet class="h-4 w-4" />
                    </StepperIndicator>
                    <StepperTitle>连接钱包</StepperTitle>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>

                <StepperItem :step="2">
                  <StepperTrigger>
                    <StepperIndicator>
                      <User class="h-4 w-4" />
                    </StepperIndicator>
                    <StepperTitle>个人信息</StepperTitle>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>

                <StepperItem :step="3">
                  <StepperTrigger>
                    <StepperIndicator>
                      <Shield class="h-4 w-4" />
                    </StepperIndicator>
                    <StepperTitle>安全验证</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              </Stepper>

              <!-- Step 1: Wallet Connection -->
              <div v-if="currentStep === 1" class="space-y-4">
                <div class="grid gap-4">
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
                  <Separator class="my-4" />
                  <div class="grid gap-4">
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
                </div>
              </div>

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
                <Alert>
                  <Mail class="h-4 w-4" />
                  <AlertTitle>验证您的邮箱</AlertTitle>
                  <AlertDescription>
                    我们已经发送验证码到您的邮箱，请查收并输入验证码。
                  </AlertDescription>
                </Alert>
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

              <div v-if="registrationError" class="text-red-500 text-sm text-center">
                {{ registrationError }}
              </div>

              <!-- Navigation Buttons -->
              <div class="flex justify-between">
                <Button
                  variant="outline"
                  @click="handleBack"
                  :disabled="currentStep === 1 || isLoading"
                >
                  返回
                </Button>
                <Button
                  @click="handleNext"
                  :disabled="isLoading"
                >
                  {{ currentStep === 3 ? '完成注册' : '下一步' }}
                  <ChevronRight class="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <p class="px-8 text-center text-sm text-muted-foreground">
            注册即表示您同意我们的
            <a href="/terms" class="underline underline-offset-4 hover:text-primary">
              服务条款
            </a>
            和
            <a href="/privacy" class="underline underline-offset-4 hover:text-primary">
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Script section remains exactly the same
import { ref, reactive } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Stepper,
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

// State
const isLoading = ref(false)
const registrationError = ref<string | null>(null)
const currentStep = ref(1)
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

// Social platforms configuration
const socialPlatforms: SocialPlatform[] = [
  { id: 'email', name: '邮箱', icon: Mail },
  { id: 'google', name: 'Google', icon: Globe },
  { id: 'apple', name: 'Apple', icon: Laptop },
  { id: 'github', name: 'Github', icon: Github }
]

const handleNext = async () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    await handleRegister()
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
  }
}
</script>