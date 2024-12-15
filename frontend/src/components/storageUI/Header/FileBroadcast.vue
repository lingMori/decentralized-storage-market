<template>
  <div class="file-broadcast-container">
    <div ref="broadcastWrapper" class="broadcast-wrapper">
      <!-- 动态背景 -->
      <div class="dynamic-background"></div>
      <div ref="broadcastContent" class="broadcast-content inline-flex items-center p-0.5">
        <div v-for="(file, index) in infiniteFiles" :key="`${file.cid}-${index}`" class="file-item group mr-4 flex items-center" @click="handleFileClick([file])">
          <div class="file-unit flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 backdrop-blur-sm rounded-full border border-transparent px-2 py-0.5">
            <FileIcon class="w-4 h-4 text-white group-hover:text-blue-200 transition-colors" />
            <span class="file-name font-medium text-white group-hover:text-blue-200 transition-colors truncate">
              {{ truncateFileName(file.fileName) }}
            </span>
          </div>
          <!-- 文件状态图标与进度条 -->
          <div class="file-status">
            <div class="file-icon">
              <FileIcon :class="getFileStatus(file.cid)" style="width: 30px;" />
            </div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue'
import { FileIcon } from 'lucide-vue-next'
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient'
import { SUBGRAPH_API } from '@/configs/SUBGRAPH_API'
import { findFilesbyAddr } from '@/lib/contract-interact/graphSQL/temp/findFilesbyAddr'
import type { File as GraphQLFile } from '@/lib/contract-interact/graphSQL/types/types'
import { gsap } from 'gsap'
import type { ComputedRef } from 'vue'

const { address } = useWeb3ModalAccount()
const recentFiles = ref<GraphQLFile[]>([])
const broadcastWrapper = ref<HTMLDivElement | null>(null)
const broadcastContent = ref<HTMLDivElement | null>(null)
const animationDuration = ref(20)
let intervalId: ReturnType<typeof setInterval> | null = null
let scrollTween: gsap.core.Tween | null = null

// 获取最近的文件
const fetchRecentFiles = async () => {
  try {
    const graphqlClient = await createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value))
    const result = await graphqlClient as { files: GraphQLFile[] }

    recentFiles.value = result.files
      .sort((a, b) => Number(b.lastUpdated) - Number(a.lastUpdated))
      .slice(0, 4)
  } catch (error) {
    console.error('Error fetching recent files:', error)
  }
}

// 文件项
const infiniteFiles: ComputedRef<(GraphQLFile | { cid: string, fileName: string, id: string, owner: string, size: number, fileType: string })[]> = computed(() => {
  const baseFiles = recentFiles.value.length 
    ? recentFiles.value 
    : [{
        cid: 'placeholder', 
        fileName: 'No files', 
        id: 'placeholder-id', 
        owner: 'placeholder-owner', 
        size: 0, 
        fileType: 'placeholder-type'
      }]
  return [...baseFiles, ...baseFiles, ...baseFiles]
})

// 截断文件名
const truncateFileName = (name: string, maxLength = 30) => {
  return name.length > maxLength
    ? `${name.slice(0, maxLength)}...`
    : name
}

// 设置滚动动画
const setupAnimation = () => {
  if (broadcastContent.value) {
    if (scrollTween) {
      scrollTween.kill()
    }

    const contentWidth = broadcastContent.value.scrollWidth / 3

    scrollTween = gsap.to(broadcastContent.value, {
      x: `-${contentWidth}px`,
      duration: animationDuration.value,
      ease: 'linear',
      repeat: -1,
      onRepeat: () => {
        gsap.set(broadcastContent.value, { x: 0 })
      }
    })
  }
}

// 获取文件状态
const getFileStatus = (cid: string) => {
  console.log(cid)
  // 根据 cid 返回文件状态，示例：上传中、已完成等
  return 'idle' // 假设有一个状态
}

// 处理文件点击
const handleFileClick = (files: (GraphQLFile | { cid: string, fileName: string, id: string, owner: string, size: number, fileType: string })[]) => {
  // 处理点击时的逻辑，例如播放音效或跳转
  console.log(files)
  // playSound()
}

onMounted(async () => {
  await fetchRecentFiles()
  await nextTick(setupAnimation)
  intervalId = setInterval(fetchRecentFiles, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (scrollTween) {
    scrollTween.kill()
  }
})

// 监听文件变化，重新启动动画
watch(recentFiles, () => {
  nextTick(setupAnimation)
})
</script>

<style scoped>
/* 动态背景 */
.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 0, 150, 0.5), rgba(0, 204, 255, 0.5));
  animation: pulse 5s infinite;
  z-index: -1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

/* 文件项动画 */
.file-name {
  transition: transform 0.2s ease, color 0.3s ease;
}

.file-name:hover {
  transform: scale(1.1) rotate(5deg);
  color: #ff5b5b;
}

/* 文件状态与进度条 */
.file-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;
}

.progress-bar {
  width: 50px;
  height: 5px;
  background-color: #ddd;
  border-radius: 2px;
  margin-top: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}
</style>
