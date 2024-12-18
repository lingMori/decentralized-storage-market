<template>
  <SwitchServerLoading :show="isSearching" />
  <div class="container mx-auto px-4 py-8">
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="text-2xl font-bold">文件查询中心</CardTitle>
        <CardDescription>检索和管理您的去中心化文件</CardDescription>
      </CardHeader>

      <CardContent>
        <!-- 搜索区域 -->
        <div class="flex space-x-4 mb-6">
          <Input v-model="searchQuery" placeholder="搜索文件名、哈希" class="flex-grow" @keyup.enter="fetchFiles" />
          <Button @click="performSearch" variant="default">
            <SearchIcon class="mr-2 h-4 w-4" /> 搜索
          </Button>
        </div>

        <!-- 文件列表 -->
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>文件哈希</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="file in paginatedFiles" :key="file.id">
              <TableCell>{{ file.value }}</TableCell>
              <TableCell>
                <HoverCard>
                  <HoverCardTrigger>
                    {{ truncateHash(file.key) }}
                  </HoverCardTrigger>
                  <HoverCardContent class=" flex w-auto p-2 text-sm">
                    {{ file.key }}
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>{{ formatDate(file.blockTimestamp) }}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" @click="fetchFileContent(file.key, file.value)">
                  查看详情
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- 分页控件 -->
        <div class="flex items-center justify-between mt-6">
          <div class="text-sm text-muted-foreground">
            共 {{ totalFiles }} 个文件，第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </div>
          <div class="">
            <Pagination v-slot="{ page }" :total="totalFiles" :sibling-count="1" show-edges :default-page="currentPage"
              @update:page="handlePageChange">
              <PaginationList v-slot="{ items }" class="flex items-center gap-1">
                <PaginationFirst />
                <PaginationPrev />
                <template v-for="(item, index) in items">
                  <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                    <Button class="w-9 h-9 p-0" :variant="item.value === page ? 'default' : 'outline'">
                      {{ item.value }}
                    </Button>
                  </PaginationListItem>
                  <PaginationEllipsis v-else :key="item.type" :index="index" />
                </template>
                <PaginationNext />
                <PaginationLast />
              </PaginationList>
            </Pagination>
          </div>
        </div>

      </CardContent>
      <Drawer :open="drawerOpen" @update:open="drawerOpen = $event">
        <DrawerContent>
          <div class="mx-auto w-full max-w-2xl">
            <DrawerHeader>
              <DrawerTitle>File Details</DrawerTitle>
              <DrawerDescription>
                Viewing content for file hash: {{ selectedFileHash }}
              </DrawerDescription>
            </DrawerHeader>
            <div class="p-4 pb-0">
              <!-- 文件详细内容展示 -->
              <ScrollArea class="h-72 w-auto rounded-md border">
                <div v-if="fileContent" class="whitespace-pre-wrap text-sm">
                  <VueFilesPreview :file="fileContent" />
                </div>
                <div v-else class="text-center text-muted-foreground">
                  Loading...
                </div>
              </ScrollArea>
            </div>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button variant="outline">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon } from 'lucide-vue-next'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VueFilesPreview } from 'vue-files-preview';
import { request, gql } from 'graphql-request'
import { SUBGRAPH_API_PublicShareSimple } from '@/configs/SUBGRAPH_API'
import { inject } from 'vue'
// import type { AxiosInstance } from 'axios'
import SwitchServerLoading from '@/components/storageUI/Loading/SwitchServerLoading.vue'
import type { KuboRPCClient } from 'kubo-rpc-client'
// The Graph 查询配置
const GRAPH_ENDPOINT = SUBGRAPH_API_PublicShareSimple

// 文件接口定义
interface FileRecord {
  id: string
  key: string
  value: string
  blockTimestamp: string
}

// 响应式状态
const files = ref<FileRecord[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const isSearching = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const IpfsClient = inject('dangoRPC') as KuboRPCClient

const drawerOpen = ref(false)
const fileContent = ref<File | null>(null) // 保存文件详细内容
// const fileUrl = ref<string>('')
const selectedFileHash = ref<string | null>(null) // 当前选择的文件哈希

// The Graph 查询方法
const fetchFiles = async () => {
  isSearching.value = true
  router.replace({
    params: {
      value: searchQuery.value
    }
  })
  // 查询文件列表
  const queryFiles = gql`
    query {
      keyValuePairs(
        first: ${pageSize.value}, 
        skip: ${(currentPage.value - 1) * pageSize.value},
        where: { 
          or: [
            { key_contains_nocase: "${searchQuery.value}" },
            { value_contains_nocase: "${searchQuery.value}" }
          ]
        },
        orderBy: blockTimestamp,
        orderDirection: desc
      ) {
        id
        key
        value
        blockTimestamp
      }
    }
  `

  // 查询文件总数
  const queryTotalCount = gql`
    query {
      keyValuePairs(
        where: { 
          or: [
            { key_contains_nocase: "${searchQuery.value}" },
            { value_contains_nocase: "${searchQuery.value}" }
          ]
        }
      ) {
        id
      }
    }
  `

  try {
    // 执行查询
    const [filesResponse, totalCountResponse] = await Promise.all([
      request<{ keyValuePairs: FileRecord[] }>(GRAPH_ENDPOINT, queryFiles),
      request<{ keyValuePairs: { id: string }[] }>(GRAPH_ENDPOINT, queryTotalCount),
    ])

    files.value = filesResponse.keyValuePairs
    totalFiles.value = totalCountResponse.keyValuePairs.length
    isSearching.value = false
  } catch (error) {
    console.error('Graph Query Error:', error)
    // 可以添加错误通知
  }
}


// 计算属性
const totalFiles = ref(0)
const totalPages = computed(() => Math.ceil(totalFiles.value / pageSize.value))
const paginatedFiles = computed(() => files.value)

// 工具方法
const truncateHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`
const formatDate = (timestamp: string) => new Date(parseInt(timestamp) * 1000).toLocaleString()

const performSearch = () => {
  currentPage.value = 1
  fetchFiles()
}
const handlePageChange = (newPage: number) => {
  currentPage.value = newPage
  fetchFiles()
}

const fetchFileContent = async (hash: string, filename: string) => {
  try {
    const fileChunks: Uint8Array[] = [] // 使用 Uint8Array 来处理二进制数据
    for await (const chunk of IpfsClient.cat(hash)) {
      fileChunks.push(chunk) // 直接添加二进制数据块
    }

    // 使用二进制数据 (Uint8Array[]) 创建一个 Blob 对象
    const fileBlob = new Blob(fileChunks, { type: 'application/octet-stream' });

    // 可选：通过 Blob 创建 File 对象（根据你的需要）
    fileContent.value = new File([fileBlob], filename, { type: 'application/octet-stream' });

    drawerOpen.value = true; // 打开 Drawer
  } catch (error) {
    console.error('Failed to fetch file:', error);
    // fileContent.value = new File(['Failed to load file content.'], { type: 'text/plain' }) // 这部分可以不改，处理失败情况。
  }
}

// 生命周期钩子
onMounted(() => {
  isSearching.value = true
  const fileName = route.params.value as string
  searchQuery.value = fileName
  fetchFiles()
})
</script>
