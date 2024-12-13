<template>
  <div class="flex flex-col bg-white" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
    <!-- Main Search Area -->
    <main class="flex-grow flex flex-col justify-center items-center px-4">
      <div class="w-full max-w-3xl">
        <!-- Logo/Title -->
        <h1 class="text-center text-4xl font-light mb-8 text-gray-800">
          IPFS 公共存储
        </h1>

        <!-- Search Container -->
        <div class="relative">
          <input 
            v-model="fileHashToRetrieve"
            type="text"
            placeholder="输入文件哈希值检索文件"
            class="w-full px-6 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          
          <div class="absolute top-0 right-0 h-full flex items-center pr-4">
            <button 
              @click="retrieveFile"
              class="text-blue-500 hover:text-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Upload Button -->
        <div class="flex justify-center space-x-4 mt-6">
          <input 
            type="file" 
            ref="fileInput"
            multiple
            @change="handleFileSelect"
            class="hidden"
          />
          <button 
            @click="triggerFileUpload"
            class="px-6 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            上传文件
          </button>
        </div>

        <!-- File Details -->
        <div v-if="retrievedFile" class="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">文件详情</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong>文件名：</strong>
              <span>{{ retrievedFile.fileName }}</span>
            </div>
            <div>
              <strong>文件类型：</strong>
              <span>{{ retrievedFile.fileType }}</span>
            </div>
            <div>
              <strong>文件大小：</strong>
              <span>{{ formatFileSize(retrievedFile.fileSize) }}</span>
            </div>
            <div>
              <strong>上传时间：</strong>
              <span>{{ formatDate(retrievedFile.timestamp) }}</span>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-600">
            <strong>上传者：</strong>
            <span>{{ truncateAddress(retrievedFile.uploader) }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ethers } from 'ethers'

// Reactive state
const fileHashToRetrieve = ref('')
const headerHeight = ref<number>(0)
const retrievedFile = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const updateHeaderHeight = () => {
 const header = document.querySelector('header')
 if (header) {
   headerHeight.value = header.offsetHeight
 }
}

// File selection handler
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    await uploadFile(file)
  }
}

// Trigger file input
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// File hash calculation
const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Upload file
const uploadFile = async (file: File) => {
  try {
    if (!window.ethereum) {
            throw new Error("Ethereum provider is not available");
        }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    
    const contract = new ethers.Contract('YOUR_CONTRACT_ADDRESS', [
      "function storeFile(string memory _fileHash, string memory _fileName, string memory _fileType, uint256 _fileSize) public"
    ], signer)

    const fileHash = await calculateFileHash(file)

    const tx = await contract.storeFile(
      fileHash, 
      file.name, 
      file.type || 'unknown',
      file.size
    )
    
    await tx.wait()
    alert('文件上传成功！')
  } catch (error) {
    console.error(error)
    alert('文件上传失败')
  }
}

// Retrieve file details
const retrieveFile = async () => {
  if (!fileHashToRetrieve.value) return

  try {
    if (!window.ethereum) {
            throw new Error("Ethereum provider is not available");
        }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract('YOUR_CONTRACT_ADDRESS', [
      "function getFile(string memory _fileHash) public view returns (tuple(address uploader, string fileHash, uint256 timestamp, string fileName, string fileType, uint256 fileSize, bool isActive))"
    ], provider)

    const fileDetails = await contract.getFile(fileHashToRetrieve.value)
    retrievedFile.value = fileDetails
  } catch (error) {
    console.error(error)
    retrievedFile.value = null
    alert('检索文件详情失败')
  }
}

// Utility functions
const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

onMounted(() => {
  updateHeaderHeight()
})
</script>

<style scoped>
/* 可以添加额外的样式微调 */
</style>
