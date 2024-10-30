<template>
    <Card class="file-list-container">
        <div class="px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Checkbox 
                    id="selectAll"
                    :checked="selectAll" 
                    :indeterminate="indeterminate"
                    @update:checked="toggleSelectAll"
                />
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
                    <tr v-for="file in files" :key="file.cid" class="file-row">
                        <td class="file-td">
                            <Checkbox 
                                :checked="isSelected(file)"
                                @update:checked="(checked) => toggleSelect(file, checked)"
                            />
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
                            <span class="file-cid">{{ file.cid }}</span>
                        </td>
                        <td class="file-td">
                            <Badge :variant="getStatusVariant(file.status)" class="status-badge">
                                {{ getStatusText(file.status) }}
                            </Badge>
                        </td>
                        <td class="file-td">{{ file.lastModified }}</td>
                        <td class="file-td">{{ file.size }}</td>
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
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem @click="handleDelete(file)" class="text-destructive">
                                        删除文件
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </td>
                    </tr>
                </tbody>
            </table>
        </ScrollArea>
    </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import Card from '@/components/ui/card/Card.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
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

const files = ref<FileItem[]>([])
const selectedFiles = ref<FileItem[]>([])

const FileType: string[] = [
    "image",
    "mp4",
    "video_extranct"
]

// 计算全选状态
const selectAll = computed(() => {
    return files.value.length > 0 && selectedFiles.value.length === files.value.length
})

// 计算半选状态
const indeterminate = computed(() => {
    return selectedFiles.value.length > 0 && selectedFiles.value.length < files.value.length
})

// const getStatusVariant = (status: string) => {
//     switch (status) {
//         case 'active':
//             return 'success'
//         case 'pending':
//             return 'warning'
//         case 'archived':
//             return 'secondary'
//         default:
//             return 'destructive'
//     }
// }

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'active':
            return 'processing'; 
        case 'pending':
            return 'pending'; // Changed 'warning' to 'secondary'
        case 'archived':
            return 'completed';
        default:
            return 'failed';
    }
}

const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
        'active': '活跃',
        'pending': '待处理',
        'archived': '已归档',
        'false': '失败'
    }
    return statusMap[status] || status
}

const isSelected = (file: FileItem) => {
    return selectedFiles.value.some(f => f.cid === file.cid)
}

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

const handleSingleFile = (file: FileItem) => {
    console.log('管理文件', file)
}

const handleArchive = (file: FileItem) => {
    console.log('归档文件', file)
}

const handleDelete = (file: FileItem) => {
    console.log('删除文件', file)
}

const handleBatchArchive = () => {
    console.log('批量归档', selectedFiles.value)
}

const handleBatchDelete = () => {
    console.log('批量删除', selectedFiles.value)
}

const InitFiles = () => {
    const statusOptions: FileItem['status'][] = ['active', 'pending', 'archived', 'false']
    
    for (let i = 0; i < 10; i++) {
        files.value.push({
            name: `文件_${i + 1}`,
            cid: `cid_${Math.random().toString(36).substr(2, 9)}`,
            status: statusOptions[i % 4],
            lastModified: new Date().toLocaleDateString(),
            size: '213 KB',
            type: FileType[i % 3],
        })
    }
}

onMounted(() => {
    InitFiles()
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
                    font-weight: 500;
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