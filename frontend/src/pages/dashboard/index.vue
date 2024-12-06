<template>
  <div style="height: 100vh;">
    <DashboardHeader />
    <!-- 动态绑定 top 样式 -->
    <div :style="{ position: 'relative', top: `${headerHeight}px` }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import DashboardHeader from '@/components/storageUI/Header/DashboardHeader.vue';

const headerHeight = ref(0);

// 计算 header 高度
const updateHeaderHeight = () => {
  const header = document.querySelector('header');
  if (header) {
    headerHeight.value = header.offsetHeight;
  }
};

// 初始化 header 高度并监听窗口大小变化
onMounted(() => {
  updateHeaderHeight(); // 初始化高度
  window.addEventListener('resize', updateHeaderHeight); // 窗口调整时更新
});

// 使用 watchEffect 来自动更新 top 样式
watchEffect(() => {
  updateHeaderHeight();
});
</script>

<style scoped lang="scss">
/* 可根据需要调整样式 */
</style>
