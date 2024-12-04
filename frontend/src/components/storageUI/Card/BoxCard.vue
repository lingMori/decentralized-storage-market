<template>
  <Card class="file-list-container">
    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Checkbox id="selectAll" :checked="selectAll" :indeterminate="indeterminate"
          @update:checked="toggleSelectAll" />
        <label for="selectAll" class="text-sm font-medium">
          {{ selectedFiles.length ? `已选择 ${selectedFiles.length} 个文件` : '选择全部' }}
        </label>
      </div>
      <div v-if="selectedFiles.length" class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="handleBatchArchive">
          批量归档
        </Button>
        <Button variant="destructive" size="sm" @click="handleBatchDelete">
          批量删除
        </Button>
      </div>
    </div>
    <ScrollArea class="file-list-scroll">
      <table class="file-table">
        <thead>
          <tr>
            <th class="file-th w-[50px]"></th>
            <th class="file-th">名称</th>
            <th class="file-th">CID</th>
            <th class="file-th">状态</th>
            <th class="file-th">最后修改</th>
            <th class="file-th">大小</th>
            <th class="file-th">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in filteredFiles" :key="file.cid" class="file-row">
            <td class="file-td">
              <Checkbox :checked="isSelected(file)" @update:checked="(checked) => toggleSelect(file, checked)" />
            </td>
            <td class="file-td">
              <div class="file-name-cell">
                <span class="file-name">{{ file.name }}</span>
                <Badge variant="outline" class="file-type-badge">
                  {{ file.type }}
                </Badge>
              </div>
            </td>
            <td class="file-td">
              <span class="file-cid">{{ truncateCID(file.cid) }}</span>
            </td>
            <td class="file-td">
              <Badge :variant="getStatusVariant(file.status)" class="status-badge" :isDot="!showFileStatus">
                {{ showFileStatus ? getStatusText(file.status) : '' }}
              </Badge>
            </td>
            <td class="file-td">{{ formatDate(file.lastModified) }}</td>
            <td class="file-td">{{ formatFileSize(file.size) }}</td>
            <td class="file-td">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click="handleSingleFile(file)">
                    管理文件
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleArchive(file)">
                    归档文件
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleDownloadFile(file)">
                    下载文件
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleArchive(file)">
                    复制cid
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="file.status!='removed'"/>
                  <DropdownMenuItem v-if="file.status!='removed'" @click="handleDelete(file)" class="text-destructive">
                    删除文件
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </ScrollArea>
    <SwitchServerLoading :show="isLoading" />
    <SwitchServerLoading :show="isDownloading" />
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import Card from '@/components/ui/card/Card.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type'
import useLocalStorage from '@/store/localStorageDB'
import SwitchServerLoading from '../Loading/SwitchServerLoading.vue'
import { fileRepo, type FileObject } from '@/lib/contract-interact/fileRepo'
import { BigNumber } from 'ethers'
import { inject } from 'vue'
import { CID, type KuboRPCClient } from 'kubo-rpc-client'
import { toast } from 'vue-sonner'
import { formatDate } from '@/lib/data-tools/dataFormer'
import timeLaster from '@/lib/data-tools/timeLaster';


// 定义常量
const FILE_TYPES = ['image', 'audio', 'video', 'application'] as const
type FileType = typeof FILE_TYPES[number]

const localStore = useLocalStorage()
const route = useRoute()
const { removeFile } = fileRepo()
const ipfsClient = inject('dangoRPC') as KuboRPCClient;


// 状态管理
// const isLoading = ref<boolean>(false)
const isDownloading = ref<boolean>(false)
const selectedFiles = ref<FileItem[]>([])
const showFileStatus = ref<boolean>(true)
const currentView = ref<string>('all')
const emit = defineEmits(["update-files"]);


const isLoading = computed(() => files.value.length === 0)
// 文件相关计算属性
const files = computed<FileItem[]>(() =>
  localStore.results
    .slice()
    .reverse()
    .filter((file): file is FileItem & { cid: string } => !!file.cid)
)

const filteredFiles = computed<FileItem[]>(() => {
  if (currentView.value === 'all') return files.value
  // return files.value.filter(file => file.type === currentView.value)
  return files.value.filter(file => file.type.startsWith(currentView.value));
})

// 全选和半选状态
const selectAll = computed(() =>
  files.value.length > 0 && selectedFiles.value.length === files.value.length
)

const indeterminate = computed(() =>
  selectedFiles.value.length > 0 &&
  selectedFiles.value.length < files.value.length
)

// 状态相关工具函数
const getStatusVariant = (status: FileItem['status']): "pending" | "default" | "secondary" | "destructive" | "outline" | "processing" | "completed" | "failed" | "online" | "offline" | "away" | "busy" | null => {
  const statusVariantMap: Record<FileItem['status'], "pending" | "default" | "secondary" | "destructive" | "outline" | "processing" | "completed" | "failed" | "online" | "offline" | "away" | "busy"> = {
    'active': 'processing',
    'pending': 'pending',
    'archived': 'completed',
    'removed': 'destructive',
    'false': 'failed'
  }
  return statusVariantMap[status] || null
}

const getStatusText = (status: FileItem['status']) => {
  const statusTextMap: Record<FileItem['status'], string> = {
    'active': '活跃',
    'pending': '待处理',
    'archived': '已归档',
    'removed': '已废弃',
    'false': '失败'
  }
  return statusTextMap[status] || status
}

// 文件选择相关方法
const isSelected = (file: FileItem) =>
  selectedFiles.value.some(f => f.cid === file.cid)

const toggleSelect = (file: FileItem, checked: boolean) => {
  if (checked) {
    selectedFiles.value.push(file)
  } else {
    selectedFiles.value = selectedFiles.value.filter(f => f.cid !== file.cid)
  }
}

const toggleSelectAll = (checked: boolean) => {
  selectedFiles.value = checked ? [...files.value] : []
}

const handleDownloadFile = async(file: FileItem) => {
  // Ensure file and cid are valid
  isDownloading.value = true;
  if (file.status!='active' || !file.cid) {
    console.error('Invalid file or CID');
    toast("下载失败", {
      description: '无效的文件或 CID'
    })
    isDownloading.value = false;
    return;
  }
  // const ipfs_url = `${IPFS_GATEWAY}/${file.cid}`
  try {
    const fileContent = [];
    for await (const chunk of ipfsClient.cat(CID.parse(file.cid))) {
      fileContent.push(chunk);
    }
    // 将内容转换为 Blob
    const blob = new Blob(fileContent, { type: 'application/octet-stream' });
    isDownloading.value = false;
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name || 'downloaded-file';
    document.body.appendChild(a);
    a.click();

  }catch (error) {
    console.log(error);
    isDownloading.value = false;
  }
}
// 文件操作方法
const handleSingleFile = (file: FileItem) => {
  console.log('管理文件', file)
}

const handleArchive = (file: FileItem) => {
  console.log('归档文件', file)
  toast('文件归档成功', {
    description: '测试toast点击事件触发'
  })
}

const handleDelete = async (file: FileItem) => {
  // console.log('删除文件', file)
  // change file from FileItem to FileObject
  const fileObject: FileObject = {
    cid: file.cid,
    fileSize: BigNumber.from(file.size),
    fileType: file.type,
    fileName: file.name
  }
  try {
    const res = await removeFile(fileObject)
    console.log(res)
    await ipfsClient.pin.rm(CID.parse(file.cid));
    for await (const chunk of ipfsClient.repo.gc()) {
      // console.log({chunk : chunk.cid?.toString()})
      chunk.cid?.toString();
    }
    await emit('update-files')

    toast('文件删除成功', {
      description: `文件 ${file.name} 废止与 ${formatDate(file.lastModified)}`,
      action: {
        label: 'undo',
        onClick: () => console.log('Undo')
      }
    })
  } catch (e) {
    console.log(e)
  }

}

const handleBatchArchive = () => {
  console.log('批量归档', selectedFiles.value)
}

const handleBatchDelete = () => {
  console.log('批量删除', selectedFiles.value)
}

// 实用工具函数
const truncateCID = (cid: string, length = 12) =>
  cid.length > length ? `${cid.slice(0, length)}...` : cid


const formatFileSize = (size: string | number) => {
  const sizeNum = typeof size === 'string'
    ? parseFloat(size.replace(/[^\d.]/g, ''))
    : size

  if (sizeNum < 1024) return `${sizeNum.toFixed(2)} B`
  if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(2)} KB`
  return `${(sizeNum / (1024 * 1024)).toFixed(2)} MB`
}

const handleNavigation = (view: string) => {
  currentView.value = FILE_TYPES.includes(view as FileType) ? view : 'all'
}

// 响应式处理
const handleWindowResize = () => {
  showFileStatus.value = window.innerWidth > 1122
}

onMounted(() => {
  handleNavigation(route.query.view?.toString() || 'all')
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

onBeforeRouteUpdate(async(to, from, next) => {
  if (to.query.view !== from.query.view) {
    isDownloading.value = true;
    await timeLaster(300)
    isDownloading.value = false;
    handleNavigation(to.query.view?.toString() || 'all')
  }
  next()
})
</script>


<style scoped lang="scss">
.file-list-container {
  height: 100%;
  width: 100%;

  .file-list-scroll {
    height: calc(100% - 60px); // 减去顶部操作栏的高度
  }

  .file-table {
    width: 100%;
    border-collapse: collapse;

    .file-th {
      padding: 0.75rem 1rem;
      background-color: var(--accent);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--muted-foreground);
      text-align: left;
      white-space: nowrap;
    }

    .file-row {
      border-bottom: 1px solid var(--border);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--accent);
      }
    }

    .file-td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--foreground);

      .file-name-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .file-name {
          // only have one line
          font-weight: 500;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-type-badge {
          font-size: 0.75rem;
        }
      }

      .file-cid {
        font-family: monospace;
        color: var(--muted-foreground);
      }

      .status-badge {
        text-transform: capitalize;
      }
    }
  }
}

// 响应式设计
@media only screen and (max-width: 768px) {
  .file-list-container {
    .file-table {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }
}
</style>
