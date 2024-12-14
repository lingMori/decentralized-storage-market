<template>
  <Card class="w-full max-w-7xl mx-auto shadow-lg border ">
    <CardHeader class="border-b ">
      <CardTitle class="flex items-center justify-between ">
        <div class="flex items-center space-x-3">
          <CloudCogIcon class="w-6 h-6 text-emerald-600" />
          <span class="font-semibold">IPFS Node Status</span>
        </div>
        <Badge :variant="nodeStatus === 'online' ? 'default' : 'destructive'" class="flex items-center space-x-2">
          <CheckCircle2Icon v-if="nodeStatus === 'online'" class="w-4 h-4 text-emerald-500" />
          <XCircleIcon v-else class="w-4 h-4 text-red-500" />
          <span>{{ nodeStatus.toUpperCase() }}</span>
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent class="p-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- Node Information Card -->
        <Card class=" shadow-md border ">
          <CardHeader class="border-b ">
            <CardTitle class="flex items-center space-x-3 ">
              <HardDriveIcon class="w-5 h-5 text-indigo-600" />
              <span class="font-semibold">Node Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 py-4">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-600">Peer ID:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <code class="text-sm bg-gray-100 px-2 py-1 rounded-md truncate max-w-[150px] text-gray-800 overflow-hidden whitespace-nowrap text-ellipsis">
                      {{ nodeInfo.peerId }}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Full Peer ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Version:</span>
              <span class="font-semibold text-gray-800">{{ nodeInfo.version }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Repository Size:</span>
              <span class="font-semibold text-gray-800">{{ formatBytes(nodeInfo.repoSize) }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Network Statistics Card -->
        <Card class=" shadow-md border ">
          <CardHeader class="border-b ">
            <CardTitle class="flex items-center space-x-3 ">
              <ServerIcon class="w-5 h-5 text-cyan-600" />
              <span class="font-semibold">Network Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 py-4">
            <div class="flex justify-between items-center">
              <span class="">Connected Peers:</span>
              <span class="font-semibold ">{{ networkStats.connectedPeers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="">Total Bandwidth:</span>
              <div class="flex items-center space-x-2">
                <ArrowUpDownIcon class="w-4 h-4 text-purple-500" />
                <span class="">
                  ↑ {{ formatBytes(networkStats.bandwidthUp) }}/s
                  ↓ {{ formatBytes(networkStats.bandwidthDown) }}/s
                </span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="">Bitswap Efficiency:</span>
              <Progress 
                :model-value="networkStats.bitswapEfficiency * 100" 
                class="h-2 w-[200px] bg-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div style="padding-top: 5px;">
        <Card class=" shadow-md border ">
          <CardHeader class="border-b ">
            <CardTitle class="flex items-center space-x-3 ">
              <HardDriveIcon class="w-5 h-5 text-indigo-600" />
              <span class="font-semibold">Node bindwith intime</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IpfsStateChar />
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  HardDrive as HardDriveIcon, 
  CloudCog as CloudCogIcon, 
  Server as ServerIcon, 
  ArrowUpDown as ArrowUpDownIcon,
  CheckCircle2 as CheckCircle2Icon, 
  XCircle as XCircleIcon 
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { inject } from 'vue'
import type { KuboRPCClient } from 'kubo-rpc-client'
import IpfsStateChar from '../Chart/IpfsStateChar.vue'

// IPFS client configuration
const ipfsClient = inject('dangoRPC') as KuboRPCClient

// Reactive state variables
const nodeStatus = ref('offline')
const nodeInfo = ref({
  peerId: '',
  version: '',
  repoSize: 0
})
const networkStats = ref({
  connectedPeers: 0,
  bandwidthUp: 0,
  bandwidthDown: 0,
  bitswapEfficiency: 0
})

// Utility function to format bytes
const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// Fetch node information
// Fetch node information
const updateNodeInfo = async () => {
  try {
    // Fetch node information concurrently
    const [id, version, repoStats] = await Promise.all([
      ipfsClient.id(),
      ipfsClient.version(),
      ipfsClient.stats.repo()
    ])

    // Fetch connected peers
    const peers = await ipfsClient.swarm.peers()

    // Start processing bandwidth stats as an AsyncIterable
    const bandwidthStats = ipfsClient.stats.bw()

    // Process streaming data from bandwidth stats
    for await (const stats of bandwidthStats) {
      // Update network statistics in real-time
      networkStats.value = {
        connectedPeers: peers.length,
        bandwidthDown: Number(stats.totalIn), // Outgoing bandwidth
        bandwidthUp: Number(stats.totalOut),   // Incoming bandwidth
        bitswapEfficiency: Number(
          1 / (Number(stats.totalIn) / (Number(stats.totalOut) || 1))
        )
      }
    }

    // Update node status and information after processing bandwidth stats
    nodeStatus.value = 'online'
    nodeInfo.value = {
      peerId: id.id.toString(),
      version: version.version,
      repoSize: Number(repoStats.repoSize)
    }
  } catch (error) {
    console.error('Failed to fetch IPFS node info:', error)
    nodeStatus.value = 'offline'
  }
}

// Periodic updates
let intervalId: ReturnType<typeof setInterval>

onMounted(async () => {
  await updateNodeInfo()
  intervalId = setInterval(updateNodeInfo, 1000) // Update every 30 seconds
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
