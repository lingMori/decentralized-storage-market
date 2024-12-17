<template>
  <div class="server-dropdown">
    <SwitchServerLoading :show="!hasLoaded" />
    <DropdownMenu>
      <DropdownMenuTrigger class="dropdown-trigger hover:text-gray-700">
        <div class="flex items-center justify-between w-full px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          <div class="flex items-center gap-2">
            <div class="status-dot" :class="getStatusClass(selectedServer?.status)" />
            <ServerIcon class="w-4 h-4" />
            <span>{{ selectedServer?.name || 'Select Server' }}</span>
          </div>
          <ChevronDown class="w-4 h-4" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent class="w-[280px]">
        <DropdownMenuLabel>Available Servers</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea class="h-[300px]">
          <div class="p-2">
            <div v-for="node in availableNodes" :key="node.id" class="mb-1">
              <DropdownMenuItem @click="selectServer(node)">
                <div class="flex items-center gap-2 w-full">
                  <div class="status-dot" :class="getStatusClass(node.status)" />
                  <ServerIcon class="w-4 h-4" :class="{ 'text-primary': selectedServer?.id === node.id }" />
                  <div class="flex flex-col flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ node.name }}</span>
                    </div>
                    <span class="text-xs text-gray-500">{{ node.location }}</span>
                  </div>
                  <Check v-if="selectedServer?.id === node.id" class="w-4 h-4 ml-2 text-primary" />
                </div>
              </DropdownMenuItem>
            </div>
          </div>
        </ScrollArea>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <PlusCircle class="w-4 h-4 mr-2" />
          Add New Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import SwitchServerLoading from '../Loading/SwitchServerLoading.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ServerIcon, ChevronDown, Check, PlusCircle } from 'lucide-vue-next'
import { useIPFSStore } from '@/store/ipfsServerDB'

const ipfsStore = useIPFSStore()

// 使用 computed 获取可用节点
const availableNodes = computed(() => ipfsStore.availableNodes)

// 获取当前选中的节点
const selectedServer = computed(() => ipfsStore.getCurrentNode)

const hasLoaded = ref<boolean>(true)

const selectServer = (node: any) => {
  hasLoaded.value = false
  
  // 模拟加载延迟
  setTimeout(() => {
    hasLoaded.value = true
    
    // 使用节点 ID 切换
    ipfsStore.switchNode(node.id)
    
    // 触发事件
    emit('server-selected', node)
  }, 1000)
}

// 获取状态对应的类名
const getStatusClass = (status?: string) => {
  if (!status) return 'status-dot--offline'
  return `status-dot--${status}`
}

// Define emits
const emit = defineEmits(['server-selected'])

onMounted(() => {
  // 可以在这里设置默认节点
  if (!selectedServer.value && availableNodes.value.length > 0) {
    ipfsStore.switchNode(availableNodes.value[0].id)
  }
})
</script>

<style scoped lang="scss">
.server-dropdown {
  width: 100%;
  max-width: 20rem; // Adjust this value based on your design

  .dropdown-trigger {
    width: 100%;
    cursor: pointer;
  }

  .status-dot {
    width: 0.5rem;
    /* w-2 */
    height: 0.5rem;
    /* h-2 */
    border-radius: 9999px;
    /* rounded-full */

    &--active {
      background-color: #34d399;
      /* bg-emerald-500 */
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    &--warning {
      background-color: #fbbf24;
      /* bg-yellow-500 */
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }

    &--offline {
      background-color: #f87171;
      /* bg-red-500 */
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
  }
}
</style>
