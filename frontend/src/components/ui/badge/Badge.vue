<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { type BadgeVariants, badgeVariants } from '.'
import { cn } from '@/lib/utils'

const props = defineProps<{
  variant?: BadgeVariants['variant']
  class?: HTMLAttributes['class']
  isDot?: boolean // New prop to control dot display
}>()
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), props.class, { 'dot': props.isDot })">
    <slot/>
  </div>
</template>

<style scoped>
.dot {
  width: 10px; /* Adjust size as needed */
  height: 10px; /* Adjust size as needed */
  border-radius: 50%; /* Makes it a circle */
  display: inline-block; /* Ensures it behaves like an inline element */
  padding: 0;
  
}
</style>