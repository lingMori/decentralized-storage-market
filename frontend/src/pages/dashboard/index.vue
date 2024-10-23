<template>
  <div style="height: 100vh;">
    <DashboardHeader />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from '@/components/storageUI/Header/DashboardHeader.vue';
</script>

<style scoped lang="scss">

</style>
