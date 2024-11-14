<template>
  <section id="content" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
    <div class="main">
      <div class="sidebar">
        <StorageSidebar />
      </div>
      <div class="main-content">
        <div class="header-actions">
          <ServerSelectMenu @server-selected="handleServerChange" />
          <div class="action-buttons">
            <Button variant="outline" size="sm">
              <UploadCloud class="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 class="w-4 h-4 mr-2" />
              Remove Files
            </Button>
          </div>
        </div>
        <div :style="{ height: `calc(100vh - ${headerHeight}px - 90px)`}">
          <BoxCard :server-id="selectedServerId" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BoxCard from '@/components/storageUI/Card/BoxCard.vue'
import { Button } from '@/components/ui/button'
import StorageSidebar from '@/components/storageUI/Sidebar/StorageSidebar.vue'
import ServerSelectMenu from '@/components/storageUI/Menu/ServerSelectMenu.vue'
import { UploadCloud, Trash2 } from 'lucide-vue-next'

const headerHeight = ref(0)
const selectedServerId = ref<string | null>(null)

// 获取header高度的函数
const updateHeaderHeight = () => {
  const header = document.querySelector('header')
  if (header) {
    headerHeight.value = header.offsetHeight
  }
}

// 处理服务器选择
const handleServerChange = (server: any) => {
  selectedServerId.value = server.id
  // 这里可以触发BoxCard组件重新加载对应服务器的文件
}

// 监听窗口大小变化，更新高度
const handleResize = () => {
  updateHeaderHeight()
}

onMounted(() => {
  updateHeaderHeight()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
section#content {
  position: relative;

  .main {
    display: flex;
    height: 100%;

    .sidebar {
      flex-shrink: 0;
      height: 100%;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      height: 100%;
      overflow: hidden;

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        gap: 1rem;

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main {
    .main-content {
      width: 100%;
      padding: 1rem;

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  }
}
</style>
