<template>
  <!-- a header outside the template -->
  <FileBroadcast />
  <BackCard :style="{ height: `calc(100vh - ${headerHeight}px)` }">
    <UploadCard></UploadCard>
    <SearchCard></SearchCard>
  </BackCard>
  <IpfsStateCard/>
</template>

<script setup lang="ts">
import UploadCard from '@/components/storageUI/Card/UploadCard.vue';
import BackCard from '@/components/storageUI/Card/BackCard.vue';
import SearchCard from '@/components/storageUI/Card/SearchCard.vue';
import FileBroadcast from '@/components/storageUI/Header/FileBroadcast.vue';
import IpfsStateCard from '@/components/storageUI/Card/IpfsStateCard.vue';

import { onMounted, ref, onUnmounted } from 'vue';
// import { File } from 'lucide-vue-next';

const headerHeight = ref(0)

const updateHeaderHeight = () => {
  const header = document.querySelector('header')
  if (header) {
    headerHeight.value = header.offsetHeight
  }
}

onMounted(() => {
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderHeight)
})

</script>

<style scoped lang="scss">
section#content {
  position: relative;
  height: 100%;

  .main {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;

    height: 100%;

    .main-content {
      position: absolute;
      z-index: 3;

      display: flex;
      border-radius: 1em;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

      section {
        width: 414px;
        height: 414px;
      }
    }

    .main-content--shadow {
      position: absolute;

      width: 878px;
      height: 464px;

      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-radius: 1em;

      &.s-index-1 {
        z-index: 1;
        background-image: var(--liniear-gradient-color-1);
        transition: transform .3s ease-in-out;

        transform: rotate(2deg);
      }

      &.s-index-2 {
        z-index: 2;
        background-image: var(--liniear-gradient-color-2);
        transition: transform .3s ease-in-out;

        transform: rotate(-2deg);

        &.animate {
          animation-name: shadow-index--2;
          animation-duration: 1s;
        }
      }
    }

    &.animated {
      .main-content--shadow {
        &.s-index-1 {
          animation-name: shadow-index--1;
          animation-duration: 1s;
        }

        &.s-index-2 {
          animation-name: shadow-index--2;
          animation-duration: 1s;
        }
      }
    }
  }
}
</style>
