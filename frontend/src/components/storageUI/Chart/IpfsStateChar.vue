<template>
  <div>
    <AreaChart :data="data" index="name" :categories="['total', 'predicted']" />
  </div>
</template>

<script setup lang="ts">
import { AreaChart } from '@/components/ui/chart-area'
import { inject, ref, onMounted } from 'vue';
import type { KuboRPCClient } from 'kubo-rpc-client';

const ipfsClient = inject('dangoRPC') as KuboRPCClient;

// Initialize dynamic chart data
const data = ref([
  { name: new Date().toISOString(), total: 0, predicted: 0 },
]);

// Function to fetch IPFS bandwidth data
const getbwstate = async () => {
  try {
    const bwstate = ipfsClient.stats.bw();
    for await (const bw of bwstate) {
      const timestamp = new Date().toISOString();

      // Update the chart data with rateIn and rateOut
      data.value.push({
        name: timestamp,
        total: bw.rateIn,        // Use rateIn for total
        predicted: bw.rateOut,   // Use rateOut for predicted
      });

      // Keep only the last 60 data points to avoid overflow (optional)
      if (data.value.length > 60) {
        data.value.shift();
      }
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  // Fetch data periodically every second
  setInterval(async () => {
    await getbwstate();
  }, 1000);
});
</script>
<style scoped></style>
