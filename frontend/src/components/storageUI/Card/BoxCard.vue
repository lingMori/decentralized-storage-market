<template>
    <Card class="file-list-container">
        <ScrollArea class="file-list-scroll">
            <table class="file-table">
                <thead>
                    <tr>
                        <th class="file-th">Name</th>
                        <th class="file-th">CID</th>
                        <th class="file-th">Status</th>
                        <th class="file-th">Last Modified</th>
                        <th class="file-th">Size</th>
                        <th class="file-th">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in files" :key="file.name" class="file-row">
                        <td class="file-td">
                            <div class="file-name-cell">
                                <span class="file-name">{{ file.name }}</span>
                                <Badge class="file-type-badge">{{ file.type }}</Badge>
                            </div>
                        </td>
                        <td class="file-td">
                            <span class="file-cid">{{ file.cid }}</span>
                        </td>
                        <td class="file-td">
                            <Badge :variant="getStatusVariant(file.status)" class="status-badge">
                                {{ file.status }}
                            </Badge>
                        </td>
                        <td class="file-td">{{ file.lastModified }}</td>
                        <td class="file-td">{{ file.size }}</td>
                        <td class="file-td">
                            <Button variant="ghost" size="sm" class="action-button" @click="handleSingleFile(file)">
                                管理文件
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </ScrollArea>
    </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/card/Card.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import { onMounted, ref } from 'vue'

interface FileItem {
    name: string
    cid: string
    status: 'active' | 'pending' | 'archived' | 'false'
    lastModified: string
    size: string
    type: string
}

const files = ref<FileItem[]>([])

const FileType: string[] = [
    "image",
    "mp4",
    "video_extranct"
]

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

const InitFiles = () => {
    const statusOptions: FileItem['status'][] = ['active', 'pending', 'archived', 'false']
    
    for (let index = 0; index < 10; index++) {
        files.value.push({
            name: `file_${index}`,
            cid: `cid_${Math.random().toString(36).substr(2, 9)}`,
            status: statusOptions[index % 4],
            lastModified: new Date().toLocaleDateString(),
            size: '213 KB',
            type: FileType[index % 3],
        })
    }
}

const handleSingleFile = (file: FileItem) => {
    console.log('handleSingleFile', file)
}

onMounted(() => {
    InitFiles()
})
</script>

<style scoped lang="scss">
.file-list-container {
    height: 100%;
    width: 100%;
    padding: 5px;
    
    .file-list-scroll {
        height: 100%;
    }

    .file-table {
        width: 100%;
        border-collapse: collapse;
        
        .file-th {
            padding: 0.75rem 1.5rem;
            background-color: var(--accent);
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            color: var(--muted-foreground);
            text-align: left;
            white-space: nowrap;

            &:first-child {
                border-top-left-radius: 0.5rem;
            }

            &:last-child {
                border-top-right-radius: 0.5rem;
            }
        }

        .file-row {
            border-bottom: 1px solid var(--border);
            transition: background-color 0.2s;

            &:hover {
                background-color: var(--accent);
            }
        }

        .file-td {
            padding: 1rem 1.5rem;
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

            .action-button {
                width: auto;
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

            .file-th, 
            .file-td {
                padding: 0.75rem 1rem;
            }
        }
    }
}
</style>