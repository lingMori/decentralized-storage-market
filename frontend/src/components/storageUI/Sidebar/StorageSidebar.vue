<template>
    <div class="sidebar-wrapper">
        <div class="sidebar-header">
            <div class="storage-info">
                <h3 class="storage-title">存储空间</h3>
                <Progress v-model="usedStorage" :is-loading=isLoading class="storage-progress" />
                <p class="storage-details">
                    已使用 {{ formatStorage(usedStorage) }} / {{ formatStorage(totalStorage) }}
                </p>
            </div>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-section">
                <h4 class="nav-title">存储位置</h4>
                <div class="nav-items">
                    <Button 
                        variant="ghost" 
                        class="nav-item"
                        :class="{ active: currentView === 'all' }"
                        @click="handleNavigation('all')"
                    >
                        <FolderIcon class="nav-icon" />
                        全部文件
                    </Button>
                    <Button 
                        variant="ghost" 
                        class="nav-item"
                        :class="{ active: currentView === 'recent' }"
                        @click="handleNavigation('recent')"
                    >
                        <ClockIcon class="nav-icon" />
                        最近文件
                    </Button>
                    <Button 
                        variant="ghost" 
                        class="nav-item"
                        :class="{ active: currentView === 'starred' }"
                        @click="handleNavigation('starred')"
                    >
                        <StarIcon class="nav-icon" />
                        已收藏
                    </Button>
                </div>
            </div>

            <div class="nav-section">
                <h4 class="nav-title">文件类型</h4>
                <div class="nav-items">
                    <Button 
                        v-for="type in fileTypes" 
                        :key="type.id"
                        variant="ghost" 
                        class="nav-item"
                        :class="{ active: currentView === type.id }"
                        @click="handleNavigation(type.id)"
                    >
                        <component :is="type.icon" class="nav-icon" />
                        {{ type.name }}
                    </Button>
                </div>
            </div>
        </nav>

        <div class="sidebar-footer">
            <Button variant="outline" class="settings-btn">
                <SettingsIcon class="nav-icon" />
                设置
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Progress from '@/components/ui/progress/Progress.vue';
import { 
    FolderIcon, 
    ClockIcon, 
    StarIcon, 
    ImageIcon, 
    FileTextIcon, 
    VideoIcon,
    MusicIcon,
    SettingsIcon 
} from 'lucide-vue-next'
import router from '@/router';

const currentView = ref('all')
const isLoading = ref(true)

const usedStorage = ref(0) // GB
const totalStorage = ref(100) // GB

const fileTypes = [
    { id: 'image', name: '图片', icon: ImageIcon },
    { id: 'document', name: '文档', icon: FileTextIcon },
    { id: 'video', name: '视频', icon: VideoIcon },
    { id: 'audio', name: '音频', icon: MusicIcon },
]

const formatStorage = (size: number) => {
    return `${size}GB`
}

const handleNavigation = (view: string) => {
    currentView.value = view
    // 触发路由或状态更新，在路由中增加view参数作为查询参数，使用vue router
    router.push({ query: { view } })

}

const getUsedStorage = async():Promise<number> => {
    // 获取已使用存储
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Math.floor(Math.random() * 100));
        }, 1000);
    });
}

const updateUsedStorage = async() => {
    // 更新已使用存储
    const newUsedStorage = await getUsedStorage()
    isLoading.value = false
    usedStorage.value = newUsedStorage
}

onMounted(() => {
    updateUsedStorage()
})

</script>

<style scoped lang="scss">
.sidebar-wrapper {
    width: 240px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: hsl(var(--background));
    border-right: 1px solid hsl(var(--border));
    padding: 1rem;
    gap: 1.5rem;
}

.sidebar-header {
    .storage-info {
        .storage-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }

        .storage-progress {
            margin-bottom: 0.5rem;
        }

        .storage-details {
            font-size: 0.875rem;
            color: hsl( var(--muted-foreground));
        }
    }
}

.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .nav-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .nav-title {
            font-size: 0.875rem;
            font-weight: 500;
            color: hsl(var(--muted-foreground));
            padding: 0 0.5rem;
        }

        .nav-items {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .nav-item {
                justify-content: flex-start;
                gap: 0.5rem;
                padding: 0.5rem;
                font-size: 0.875rem;
                width: 100%;
                
                .nav-icon {
                    width: 1rem;
                    height: 1rem;
                }

                &.active {
                    background-color: hsl(var(--accent));
                    color: hsl(var(--accent-foreground));
                }
            }
        }
    }
}

.sidebar-footer {
    .settings-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .nav-icon {
            width: 1rem;
            height: 1rem;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .sidebar-wrapper {
        position: fixed;
        left: -240px;
        transition: left 0.3s ease;
        z-index: 50;
        
        &.active {
            left: 0;
        }
    }
}
</style>
