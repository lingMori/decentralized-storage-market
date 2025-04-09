<template>
  <Toaster />
  <router-view>
  </router-view>
</template>

<script setup lang="ts">

import walletModel from './lib/web3-wallect';
import useLocalStorage from './store/localStorageDB';
import { Toaster } from '@/components/ui/sonner'

const model = walletModel;

model.setThemeMode('dark');
const localStorageDB = useLocalStorage();
localStorageDB.clearCache();


</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');
</style>
