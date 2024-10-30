<!-- components/ui/loading-overlay/LoadingOverlay.vue -->
<template>
    <Transition name="fade">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-background rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
          <div class="loading-spinner">
            <svg 
              class="animate-spin h-8 w-8 text-primary" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                class="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                stroke-width="4"
              />
              <path 
                class="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p class="text-sm text-muted-foreground">{{ message || 'Loading...' }}</p>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    show: boolean
    message?: string
  }>()
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>