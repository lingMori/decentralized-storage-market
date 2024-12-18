<template>
  <div class="flex flex-col " :style="{ height: `calc(100vh - ${headerHeight}px)` }">
    <!-- Main Search Area -->
    <main class="flex-grow flex flex-col justify-center items-center px-4">
      <div class="w-full max-w-3xl">
        <!-- Logo/Title -->
        <h1 class="text-center text-4xl font-light mb-8 icon-color">
          IPFS 公共存储
        </h1>

        <!-- Search Container -->
        <div class="relative">
          <input v-model="fileHashToRetrieve" type="text" placeholder="输入文件哈希值检索文件" @keyup.enter="retrieveFile"
            class="w-full text-black px-6 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />

          <div class="absolute top-0 right-0 h-full flex items-center pr-4">
            <button @click="retrieveFile" class="icon-color">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="relative w-full">
          <!-- File Upload Button -->
          <div class="flex justify-center space-x-4 mt-6">
            <input type="file" ref="fileInput" multiple @change="handleFileSelect" class="hidden" />
            <Button @click="triggerFileUpload" variant="outline" class="px-6 py-2 icon-color">
              <Upload class="mr-2 h-4 w-4" />
              上传文件
            </Button>
          </div>

          <!-- Drawer for Upload Progress -->
          <Drawer :open="isUploading" @update:open="toggleDrawer">
            <DrawerContent>
              <div class="mx-auto w-full max-w-xl">
                <DrawerHeader>
                  <DrawerTitle>文件上传进度</DrawerTitle>
                  <DrawerDescription>正在将文件上传到 IPFS</DrawerDescription>
                  <DrawerClose @click="closeDrawer" class="absolute right-4 top-4">
                    <X class="h-4 w-4" />
                  </DrawerClose>
                </DrawerHeader>

                <div class="space-y-4 w-full">
                  <!-- Stepper Card -->
                  <Stepper class="flex w-full items-start gap-2" v-model="currentUploadStep">
                    <StepperItem v-for="step in uploadSteps" :key="step.step" v-slot="{ state }"
                      class="relative flex w-full flex-col items-center justify-center" :step="step.step">
                      <StepperSeparator v-if="step.step !== uploadSteps[uploadSteps.length - 1].step"
                        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />
                      <StepperTrigger as-child>
                        <Button :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                          size="icon" class="z-10 rounded-full shrink-0"
                          :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']">
                          <CheckIcon v-if="state === 'completed'" class="size-5" />
                          <CircleIcon v-if="state === 'active'" />
                          <DotIcon v-if="state === 'inactive'" />
                        </Button>
                      </StepperTrigger>
                      <div class="mt-5 flex flex-col items-center text-center">
                        <StepperTitle :class="[state === 'active' && 'text-primary']"
                          class="text-sm font-semibold transition lg:text-base">
                          {{ step.title }}
                        </StepperTitle>
                        <StepperDescription :class="[state === 'active' && 'text-primary']"
                          class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm">
                          {{ step.description }}
                        </StepperDescription>
                      </div>
                    </StepperItem>
                  </Stepper>

                  <!-- Overall Progress -->
                  <div class="w-full">
                    <div class="flex mb-2 items-center justify-center">
                      <span class="text-sm font-medium icon-color">
                        总体进度 ({{ overallProgress * totalFiles / 100 }}/{{ totalFiles }})
                      </span>
                      <span class="text-sm font-medium icon-color">
                        {{ overallProgress }}%
                      </span>
                    </div>
                    <Progress :model-value="overallProgress" class="w-full icon-color" />
                  </div>

                  <!-- Individual File Progress List -->
                  <ScrollArea class="h-[200px] w-full rounded-md border p-4">
                    <div class="space-y-3">
                      <div v-for="file in uploadedFiles" :key="file.name" class="flex items-center space-x-4">
                        <div class="flex-grow">
                          <div class="flex justify-between mb-1">
                            <span class="text-xs font-medium icon-color truncate max-w-[200px]">
                              {{ file.name }}
                            </span>
                            <span class="text-xs font-medium icon-color">
                              {{ file.progress }}%
                            </span>
                          </div>
                          <!-- <Progress :model-value="file.progress" :class="[
                            'w-full',
                            'icon-color'
                          ]" /> -->
                          <!-- 为什么ban了，因为他妈的渲染20000个试试（）） -->
                        </div>
                        <div>
                          <CheckCircle v-if="file.progress === 100" class="h-5 w-5 text-green-500" />
                          <Loader2 v-else class="h-5 w-5 text-blue-500 animate-spin" />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <!-- Upload Summary -->
                  <div class="flex justify-between items-center mt-4">
                    <div class="text-sm text-gray-600">
                      总文件大小: {{ formatTotalFileSize }}
                    </div>
                    <Button @click="cancelUpload" :disabled="isUpchaining" variant="destructive" size="sm">
                      取消上传
                    </Button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <!-- File Details -->
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, computed } from 'vue'
import { ethers } from 'ethers'
import type { KuboRPCClient } from 'kubo-rpc-client';
import { Upload, CheckCircle, Loader2, X } from 'lucide-vue-next'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer'
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { contractAddress_PublicShareSimple } from '@/configs/CONTRACT_ADDRESS';
import abi from '/Users/ask/Documents/code/github/storage-market/contract/data-market/abi/PublicShareSimple.json'
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
// Types
interface UploadFile {
  name: string
  progress: number
  size: number
}

// Reactive State
const fileHashToRetrieve = ref('')
const headerHeight = ref<number>(0)
const fileInput = ref<HTMLInputElement | null>(null)
const IpfsClient = inject('dangoRPC') as KuboRPCClient

// Upload Specific State
const isUploading = ref(false)
const isUpchaining = ref(false)
const uploadedFiles = ref<UploadFile[]>([])
const totalFiles = ref(0)
const currentUploadStep = ref<number>(1)
const router = useRouter()
// 定义上传步骤
const uploadSteps = [
  {
    step: 1,
    title: '选择文件',
    description: '选择要上传的文件',
  },
  {
    step: 2,
    title: '上传到 IPFS',
    description: '将文件上传到分布式存储',
  },
  {
    step: 3,
    title: '上传到区块链',
    description: '将文件元数据记录到智能合约',
  }
]

// Computed Properties
const overallProgress = computed(() => {
  if (uploadedFiles.value.length === 0) return 0
  const totalProgress = uploadedFiles.value.reduce((sum, file) => sum + file.progress, 0)
  return Math.round(totalProgress / uploadedFiles.value.length)
})

const formatTotalFileSize = computed(() => {
  const totalBytes = uploadedFiles.value.reduce((sum, file) => sum + file.size, 0)
  return formatFileSize(totalBytes)
})

const closeDrawer = () => {
  isUploading.value = false
}

// 切换 Drawer 状态的方法
const toggleDrawer = (open: boolean) => {
  isUploading.value = open
}

// Update Header Height
const updateHeaderHeight = () => {
  const header = document.querySelector('header')
  if (header) {
    headerHeight.value = header.offsetHeight
  }
}

// File Upload Methods
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    await uploadFiles(input.files)
  }
}

const putToIpfs = async (files: FileList) => {
  const uploadedHashes = []
  isUploading.value = true
  uploadedFiles.value = Array.from(files).map(file => ({
    name: file.name,
    progress: 0,
    size: file.size
  }))
  totalFiles.value = files.length

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const response = await IpfsClient.add(file, {
        progress: (progress) => {
          const progressPercentage = Math.round((progress / file.size) * 100)
          console.log(`File ${file.name} progress: ${progressPercentage}%`)
          uploadedFiles.value[i].progress = progressPercentage
        }
      })
      uploadedHashes.push(response.cid.toString())
    }

    return uploadedHashes
  } catch (error) {
    console.error('IPFS Upload Error:', error)
    isUploading.value = false
    throw error
  }
}

const uploadFiles = async (files: FileList) => {
  try {
    if (!window.ethereum) {
      throw new Error("Ethereum provider is not available");
    }

    // 步骤1: 选择文件
    currentUploadStep.value = 1
    if (files.length === 0) {
      throw new Error("No files selected");
    }

    // 步骤2：上传到 IPFS
    currentUploadStep.value = 2
    const fileHashs = await putToIpfs(files)
    console.log('ipfs uploaded over !')

    // upload to chain
    // 步骤3：上传到区块链
    currentUploadStep.value = 3
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress_PublicShareSimple, abi, signer)
    // console.log("file uploaded", file); // test file object
    isUpchaining.value = true
    const fileNames = fileHashs.map((fileHash, index) => (files[index].name))
    const tx = await contract.setBatch(
      fileHashs,
      fileNames
    )
    await tx.wait();

    toast('下载成功', {
      description: `文件上传成功`,
      icon: Upload,
      style: {
        background: 'linear-gradient(145deg, #56ab2f 0%, #a8e063 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '16px 24px',
      },
      duration: 3000,
      position: 'bottom-center'
    });

    cancelUpload()

    console.log('Uploaded File Hashes:', fileHashs)
  } catch (error) {
    console.error(error)
    cancelUpload()
    alert('文件上传失败')
  }
}

const cancelUpload = () => {
  isUploading.value = false
  isUpchaining.value = false
  uploadedFiles.value = []
  totalFiles.value = 0
  currentUploadStep.value = 0
}

// Existing methods from original component
const retrieveFile = async () => {
  if (!fileHashToRetrieve.value) return

  try {
    const value = fileHashToRetrieve.value
    // 这里是模拟查询的逻辑，你可以保留现有查询逻辑

    // 跳转到 /result/xxx 页面
    router.push({ name: 'Result', params: { value: value } })
  } catch (error) {
    console.error('Failed to retrieve file:', error)
    alert('检索文件失败')
  }
}

// Utility functions
const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

onMounted(() => {
  updateHeaderHeight()
})
</script>

<style scoped>
/* Additional style tweaks can be added here */
</style>
