<template>
  <div class="min-h-screen flex">
    <div
      class="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
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

              <!-- Step 1: Wallet Connection -->
              <div v-if="currentStep === 1" class="space-y-4">
                <div class="grid gap-4">
                  <Button class="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white" @click="handleConnectWallet"
                    :disabled="isLoading">
                    <Wallet class="mr-2 h-5 w-5" />
                    {{ isLoading ? '连接中...' : '连接 MetaMask' }}
                  </Button>
                  <Button class="w-full h-12" variant="outline" :disabled="isLoading" @click="handleRegister">
                    <Globe class="mr-2 h-5 w-5" />
                    注册个人存储账户
                  </Button>
                  <Separator class="my-4" />
                  <div class="grid gap-4">
                    <Button  v-for="platform in socialPlatforms" :key="platform.id" class="w-full h-12" variant="outline"
                      @click="() => handleSocialLogin(platform.id)">
                      <component :is="platform.icon" class="mr-2 h-5 w-5" />
                      {{ platform.name }}登录
                    </Button>
                  </div>
                </div>
              </div>

              <div v-if="registrationError" class="text-red-500 text-sm text-center">
                {{ registrationError }}
              </div>

              <!-- Navigation Buttons -->
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
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'

import {
  Wallet,
  Mail,
  Github,
  Globe,
  Laptop,
} from 'lucide-vue-next'
import { useWeb3ModalAccount, useWeb3Modal } from '@web3modal/ethers5/vue'
import { useInstaShareContract } from '@/lib/contract-interact/useContract'
import { accountRepo } from '@/lib/contract-interact/accountRepp'
import { toast } from 'vue-sonner'
import router from '@/router'
import { AlertCircle } from 'lucide-vue-next'
import { error } from 'console'

interface SocialPlatform {
  id: string
  name: string
  icon: any
}

// State
const isLoading = ref(false)
const registrationError = ref<string | null>(null)
const currentStep = ref(1)

// Toast and Web3
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
  toast('该平台功能未启用', {
      description: `${platform} 登录失败，请尝试其他方式登录`,
      icon: AlertCircle,
      style: {
        background: 'linear-gradient(145deg, #ff416c 0%, #ff4b2b 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '16px 24px',
      },
      duration: 3000,
      position: 'bottom-center'
    });
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

    const response = await register()

    if (response && response.success) {
      toast({
        title: "注册成功",
        description: "欢迎加入InstaShare网络!",
        variant: "default"
      })
      router.push('/dashboard/upload')
    } else {
      console.log(response)
      // throw new Error(response?.error || '注册失败')
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
