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
                  >
                    <Wallet class="mr-2 h-5 w-5" />
                    连接 MetaMask
                  </Button>
                  <Button class="w-full h-12" variant="outline">
                    <Globe class="mr-2 h-5 w-5" />
                    连接 WalletConnect
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="social" class="space-y-4">
                <div class="grid gap-4 mt-4">
                  <Button class="w-full h-12" variant="outline">
                    <Mail class="mr-2 h-5 w-5" />
                    邮箱登录
                  </Button>
                  <Button class="w-full h-12" variant="outline">
                    <Globe class="mr-2 h-5 w-5" />
                    Google 登录
                  </Button>
                  <Button class="w-full h-12" variant="outline">
                    <Laptop class="mr-2 h-5 w-5" />
                    Apple 登录
                  </Button>
                  <Button class="w-full h-12" variant="outline">
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
            >
              现在加入InstaShare网络
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup lang="ts">
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
  
  const props = defineProps<{
    isLoggedIn: boolean
  }>()
  
  const emit = defineEmits<{
    'update:isLoggedIn': [value: boolean]
  }>()
  
  const { isConnected } = useWeb3ModalAccount()
  const { open } = useWeb3Modal()
  const { getSigner } = useInstaShareContract()
  const { register } = accountRepo()
  
  const updateLoginStatus = (value: boolean) => {
    emit('update:isLoggedIn', value)
  }
  
  const connectWallet = async () => {
    await open()
    while (!isConnected.value) {
      console.log("waiting for connect")
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    updateLoginStatus(true)
  }
  
  const registerInsta = async () => {
    try {
      if (!props.isLoggedIn) {
        await connectWallet()
        const signer = getSigner()
        const address = await signer.getAddress()
        const response = await register()
        console.log(response)
      }
    } catch (error) {
      console.log("registration error: ", error)
    }
  }
  </script>