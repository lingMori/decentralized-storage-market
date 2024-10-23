<template>
    <section id="content" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
      <div class="main">
        <div class="sidebar">
          <StorageSidebar />
        </div>
        <div class="main-content">
          <div class="fb-action-buttons">
            <Button>Add Files</Button>
            <Button>Remove Files</Button>
          </div>
          <div :style="{ height: `calc(100vh - ${headerHeight}px - 90px)`}">
            <BoxCard />
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import BoxCard from '@/components/storageUI/Card/BoxCard.vue'
  import Button from '@/components/ui/button/Button.vue'
  import StorageSidebar from '@/components/storageUI/Sidebar/StorageSidebar.vue'
  
  const headerHeight = ref(0)
  const fbbuttonHeight = ref(0)
  
  // 获取header高度的函数
  const updateHeaderHeight = () => {
    const header = document.querySelector('header')
    if (header) {
      headerHeight.value = header.offsetHeight
    }
  }

  const updateFbButtonHeight = () => {
    const header = document.getElementsByClassName('fb-action-buttons')
    if (header) {
        fbbuttonHeight.value = header[0].clientHeight
    }
  }
  
  // 监听窗口大小变化，更新高度
  const handleResize = () => {
    updateHeaderHeight()
    updateFbButtonHeight()
  }
  
  onMounted(() => {
    updateHeaderHeight()
    updateFbButtonHeight()
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
  
        .fb-action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
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
      }
    }
  }
  </style>