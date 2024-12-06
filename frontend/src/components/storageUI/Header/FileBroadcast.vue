<template>
  <div class="file-broadcast-container">
    <div ref="broadcastWrapper" class="broadcast-wrapper">
      <div ref="broadcastContent" class="broadcast-content inline-flex items-center p-0.5">
        <div v-for="(file, index) in infiniteFiles" :key="`${file.cid}-${index}`"
          class="file-item group mr-4 flex items-center">
          <div
            class="file-unit flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 backdrop-blur-sm rounded-full border border-transparent px-2 py-0.5">
            <FileIcon class="w-4 h-4 text-white group-hover:text-blue-200 transition-colors" />
            <span class="file-name font-medium text-white group-hover:text-blue-200 transition-colors truncate">
              {{ truncateFileName(file.fileName) }}
            </span>
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

const { address } = useWeb3ModalAccount()
const recentFiles = ref<GraphQLFile[]>([])
const broadcastWrapper = ref<HTMLDivElement | null>(null)
const broadcastContent = ref<HTMLDivElement | null>(null)
const animationDuration = ref(20)
let intervalId: ReturnType<typeof setInterval> | null = null
let scrollTween: gsap.core.Tween | null = null

const fetchRecentFiles = async () => {
  try {
    const graphqlClient = await createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value))
    const result = await graphqlClient as { files: GraphQLFile[] }

    recentFiles.value = result.files
      .sort((a, b) => Number(b.lastUpdated) - Number(a.lastUpdated))
      .slice(0, 10)
  } catch (error) {
    console.error('Error fetching recent files:', error)
  }
}

const infiniteFiles = computed(() => {
  const baseFiles = recentFiles.value.length ? recentFiles.value : [{ cid: 'placeholder', fileName: 'No files' }]
  return [...baseFiles, ...baseFiles, ...baseFiles]
})

const truncateFileName = (name: string, maxLength = 30) => {
  return name.length > maxLength
    ? `${name.slice(0, maxLength)}...`
    : name
}

const setupAnimation = () => {
  if (broadcastContent.value) {
    // Stop previous animation if exists
    if (scrollTween) {
      scrollTween.kill()
    }

    // Measure the total width of content
    const contentWidth = broadcastContent.value.scrollWidth / 3

    scrollTween = gsap.to(broadcastContent.value, {
      x: `-${contentWidth}px`,
      duration: animationDuration.value,
      ease: 'linear',
      repeat: -1,
      onRepeat: () => {
        // Reset position instantly after each cycle
        gsap.set(broadcastContent.value, { x: 0 })
      }
    })
  }
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

// Restart animation when files change
watch(recentFiles, () => {
  nextTick(setupAnimation)
})
</script>
