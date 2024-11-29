<template>
  <Dialog :open="!isLoggedIn" @update:open="(val) => updateLoginStatus(!val)">
    <DialogContent v-on:interact-outside="(e: Event) => {e.preventDefault();}">
      <Card class="w-full max-w-md mx-auto border-0 shadow-none">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">欢迎来到 InstaShare</CardTitle>
          <CardDescription class="text-center">
            请选择您喜欢的登录方式继续
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs default-value="wallet" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">Web3 钱包</TabsTrigger>
              <TabsTrigger value="social">社交账号</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" class="space-y-4">
              <div class="grid gap-4 mt-4">
                <Button 
                  class="w-full h-12 bg-orange-600 hover:bg-orange-600 text-white border-none transition-all duration-300 group relative overflow-hidden" 
                  variant="outline" 
                  @click="connectWallet"
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
                  class="w-full h-12" 
                  variant="outline"
                  @click="() => socialLogin('email')"
                >
                  <Mail class="mr-2 h-5 w-5" />
                  邮箱登录
                </Button>
                <Button 
                  class="w-full h-12" 
                  variant="outline"
                  @click="() => socialLogin('google')"
                >
                  <Globe class="mr-2 h-5 w-5" />
                  Google 登录
                </Button>
                <Button 
                  class="w-full h-12" 
                  variant="outline"
                  @click="() => socialLogin('apple')"
                >
                  <Laptop class="mr-2 h-5 w-5" />
                  Apple 登录
                </Button>
                <Button 
                  class="w-full h-12" 
                  variant="outline"
                  @click="() => socialLogin('github')"
                >
                  <GithubIcon class="mr-2 h-5 w-5" />
                  Github 登录
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <Separator class="w-full" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">
                或者
              </span>
            </div>
          </div>

          <Button 
            class="w-full" 
            variant="default"
            @click="registerInsta"
            :disabled="isLoading"
          >
            {{ isLoading ? '注册中...' : '现在加入InstaShare网络' }}
          </Button>

          <!-- 错误提示 -->
          <div v-if="registrationError" class="mt-4 text-red-500 text-sm text-center">
            {{ registrationError }}
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Button from '@/components/ui/button/Button.vue'
import { Separator } from '@/components/ui/separator'
import {
  Wallet,
  Mail,
  Github as GithubIcon,
  Globe,
  Laptop
} from 'lucide-vue-next'
import { useWeb3ModalAccount, useWeb3Modal } from '@web3modal/ethers5/vue'
import { useInstaShareContract } from '@/lib/contract-interact/useContract'
import { accountRepo } from '@/lib/contract-interact/accountRepp'
import { useToast } from '@/components/ui/toast'
import router from '@/router'

const props = defineProps<{
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  'update:isLoggedIn': [value: boolean]
}>()

const { toast } = useToast()
const { isConnected } = useWeb3ModalAccount()
const { open } = useWeb3Modal()
const { getSigner } = useInstaShareContract()
const { register } = accountRepo()

// 新增：加载状态和错误状态
const isLoading = ref(false)
const registrationError = ref<string | null>(null)

const updateLoginStatus = (value: boolean) => {
  emit('update:isLoggedIn', value)
}

const connectWallet = async () => {
  try {
    await open()
    // 添加超时和重试机制
    // const connectTimeout = new Promise((_, reject) => 
    //   setTimeout(() => reject(new Error('连接钱包超时')), 30000)
    // ) // Added closing parenthesis here

    await Promise.race([
      new Promise<void>(resolve => {
        const timer = setInterval(() => {
          if (isConnected.value) {
            // Use Vue Router to navigate to '/dashboard/upload'
            router.push('/dashboard/upload');

            updateLoginStatus(true);
            
            clearInterval(timer);
            resolve();
          }
        }, 500);
      })
    ]);
  } catch (error) {
    toast({
      title: "钱包连接失败",
      description: error instanceof Error ? error.message : "未知错误",
      variant: "destructive"
    })
    throw error
  }
}

const registerInsta = async () => {
  // 重置错误状态
  registrationError.value = null
  
  try {
    // 设置加载状态
    isLoading.value = true

    // 如果未登录，先连接钱包
    if (!props.isLoggedIn) {
      await connectWallet()
    }

    const signer = getSigner()
    const address = await signer.getAddress()

    // 注册前的验证
    if (!address) {
      throw new Error('无法获取钱包地址')
    }

    // 执行注册
    const response = await register()

    // 处理注册结果
    if (response && response.success) {
      toast({
        title: "注册成功",
        description: "欢迎加入InstaShare网络！",
        variant: "default"
      })
      updateLoginStatus(true)
    } else {
      throw new Error(response?.error || '注册失败')
    }
  } catch (error) {
    // 详细的错误处理
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    registrationError.value = errorMessage

    toast({
      title: "注册失败",
      description: errorMessage,
      variant: "destructive"
    })
  } finally {
    // 重置加载状态
    isLoading.value = false
  }
}

// 社交账号登录占位方法
const socialLogin = (platform: 'email' | 'google' | 'apple' | 'github') => {
  // TODO: 实现具体的社交账号登录逻辑
  toast({
    title: "功能开发中",
    description: `${platform}登录暂未支持`,
    variant: "default"
  })
}
</script>
