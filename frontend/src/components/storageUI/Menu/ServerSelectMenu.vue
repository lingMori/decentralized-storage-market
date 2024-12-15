<!-- ServerDropdown.vue -->
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
            <div v-for="server in servers" :key="server.id" class="mb-1">
              <DropdownMenuItem @click="selectServer(server)">
                <div class="flex items-center gap-2 w-full">
                  <div class="status-dot" :class="getStatusClass(server.status)" />
                  <ServerIcon class="w-4 h-4" :class="{ 'text-primary': selectedServer?.id === server.id }" />
                  <div class="flex flex-col flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ server.name }}</span>
                    </div>
                    <span class="text-xs text-gray-500">{{ server.location }}</span>
                  </div>
                  <Check v-if="selectedServer?.id === server.id" class="w-4 h-4 ml-2 text-primary" />
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
import { onMounted, ref } from 'vue'
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

type ServerStatus = 'active' | 'warning' | 'offline'
type ServerType = 'production' | 'staging' | 'development'

interface Server {
  id: string
  name: string
  location: string
  type: ServerType
  status: ServerStatus
}

// Sample data - replace with your actual server data
const servers = ref<Server[]>([
  {
    id: '1',
    name: 'Production Server',
    location: 'US East (N. Virginia)',
    type: 'production',
    status: 'active'
  },
  {
    id: '2',
    name: 'Staging Server',
    location: 'US West (Oregon)',
    type: 'staging',
    status: 'warning'
  },
  {
    id: '3',
    name: 'Development Server',
    location: 'Europe (Frankfurt)',
    type: 'development',
    status: 'offline'
  }
])

const selectedServer = ref<Server | null>(null)
const hasLoaded = ref<boolean | null>(true)

const selectServer = (server: Server) => {
  hasLoaded.value = false
  setTimeout(() => {
    hasLoaded.value = true
    selectedServer.value = server
  }, 1000);
  emit('server-selected', server)
}

// 获取状态对应的类名
const getStatusClass = (status?: ServerStatus) => {
  if (!status) return 'status-dot--offline'
  return `status-dot--${status}`
}

// Define emits
const emit = defineEmits(['server-selected'])

onMounted(() => {
  selectedServer.value = servers.value[0]
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
