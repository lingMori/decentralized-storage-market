<template>
    <section id="content">
        <div class="main">
            <div class="main-content">
                <div class=" pb-3 flex flex-row gap-x-3">
                  <Button class="btn">Add Files</Button>
                  <Button class="btn">Add Files</Button>
                </div>
                <BoxCard />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import BoxCard from '@/components/storageUI/Card/BoxCard.vue';
import Button from '@/components/ui/button/Button.vue';
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
      flex-direction: column;
      position: absolute;
      z-index: 3;

      display: flex;
      border-radius: 1em;
      box-shadow: none;
      // box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);
      
    }
  }
}

.btn{
  background-color: var(--storm-bg-strong);
}
</style>