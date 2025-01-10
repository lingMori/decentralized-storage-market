<template>
  <div>
    <Button @click="registerStorage">
      register of storage
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { testContract } from '../../../test/ contractTest';

const registerStorage = async() => {
  await testContract()
}

</script>

<style scoped>

</style>
