<template>
  <Card class="w-full max-w-4xl mx-auto">
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span>IPFS Node Status</span>
        <Badge :variant="nodeStatus === 'online' ? 'default' : 'destructive'">
          {{ nodeStatus.toUpperCase() }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 gap-4">
        <!-- Node Information Card -->
        <Card>
          <CardHeader>
            <CardTitle>Node Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between truncate">
                <span class="font-medium">Peer ID:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <code class="text-sm max-w-[10px]">
                        {{ nodeInfo.peerId }}
                      </code>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Full Peer ID</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div class="flex justify-between">
                <span>Version:</span>
                <span>{{ nodeInfo.version }}</span>
              </div>
              <div class="flex justify-between">
                <span>Repository Size:</span>
                <span>{{ formatBytes(nodeInfo.repoSize) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Network Statistics Card -->
        <Card>
          <CardHeader>
            <CardTitle>Network Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Connected Peers:</span>
                <span>{{ networkStats.connectedPeers }}</span>
              </div>
              <div class="flex justify-between truncate">
                <span>Total Bw:</span>
                <span>
                  ↑ {{ formatBytes(networkStats.bandwidthUp) }}/s
                  ↓ {{ formatBytes(networkStats.bandwidthDown) }}/s
                </span>
              </div>
              <div class="flex justify-between">
                <span>Bitswap Efficiency:</span>
                <Progress 
                  :model-value=" networkStats.bitswapEfficiency * 100" 
                  class="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- use chart under to design cards -->
      
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Badge from '@/components/ui/badge/Badge.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import { Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip'
import { inject } from 'vue'
import type { KuboRPCClient } from 'kubo-rpc-client'
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient'
import { SUBGRAPH_API } from '@/configs/SUBGRAPH_API'
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue'
import { findFilesbyAddr } from '@/lib/contract-interact/graphSQL/temp/findFilesbyAddr'
import type { File as GraphQLFile } from '@/lib/contract-interact/graphSQL/types/types'
// IPFS client configuration
const ipfsClient = inject('dangoRPC') as KuboRPCClient;
const {address} = useWeb3ModalAccount();

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
const pinnedContent = ref<GraphQLFile[]>([])

// Utility functions
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

const fetchRecentFiles = async () => {
  try {
    const graphqlClient = await createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value))
    const result = await graphqlClient as { files: GraphQLFile[] }

    pinnedContent.value = result.files
      .sort((a, b) => Number(b.lastUpdated) - Number(a.lastUpdated))
      .slice(0, 4)
  } catch (error) {
    console.error('Error fetching recent files:', error)
  }
}

// Fetch node information
const updateNodeInfo = async () => {
  try {

    const [id, version] = await Promise.all([
      ipfsClient.id(),
      ipfsClient.version()
    ])

    nodeStatus.value = 'online'
    nodeInfo.value = {
      peerId: id.id.toString(),
      version: version.version,
      repoSize: Number((await ipfsClient.stats.repo()).repoSize)
    }

    for await (const stats of ipfsClient.stats.bw()) {
      networkStats.value = {
        connectedPeers: (await ipfsClient.swarm.peers()).length,
        bandwidthDown: Number(stats.rateOut),
        bandwidthUp: Number(stats.rateIn),
        bitswapEfficiency:  Number(stats.totalIn / stats.totalOut)
      }
    }

    
  } catch (error) {
    console.error('Failed to fetch IPFS node info:', error)
    nodeStatus.value = 'offline'
  }
}

// Periodic updates
let intervalId: ReturnType<typeof setInterval>

onMounted(async() => {
  updateNodeInfo()
  await fetchRecentFiles()
  intervalId = setInterval(updateNodeInfo, 30000) // Update every 30 seconds
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

.overflow-hidden {
  overflow: hidden;
}

.text-ellipsis {
  text-overflow: ellipsis;
}
</style>
