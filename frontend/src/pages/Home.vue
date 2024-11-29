<template>
    <div style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5 file-input">
        <Input type="file" class="input-box" @change="handleFiles" />
        <Button :data-state="isOpen" :class="isOpen ? 'button-style' : ''" @click="uploadToIPFS">
            <span class="text-color">Upload to IPFS</span>
        </Button>
      </div>
    </div>
  
    <div style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5">
        <Input id="keyNode" type="text" placeholder="input your key name" v-model="keyName" />
        <Button type="submit" @click="addKeyNode">
          Add KeyNode
        </Button>
    </div>
    </div>
  
    <div style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5">
        <Input id="nodeName" type="text" placeholder="input your Node name" v-model="nodeName" />
        <Button type="submit" @click="addNodeName">
          Publish Name Node
        </Button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">

  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  // import type { AxiosInstance } from 'axios';
  import {type KuboRPCClient } from 'kubo-rpc-client';
  import { inject, ref } from 'vue';

  const files = ref<File[]>([]);
  const isOpen = ref<boolean>(true)
  const keyName = ref('')
  const nodeName = ref('')

  const dangoIPFS_RPC = inject('dangoRPC') as KuboRPCClient;
  // const dangoIPFS_Gateway = inject('dangoGateway') as AxiosInstance;


  const handleFiles = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      files.value = Array.from(input.files);
    }
  };
  
  const addKeyNode = async() => {

  }
  
  const addNodeName = async() => {

  }
  
  
  const uploadToIPFS = async() => {
    try {
    // 使用 CID 从 IPFS 获取文件内容
    // const decoder = new TextDecoder(); // 创建解码器用于将 Uint8Array 转换为字符串
    for await (const bandwith of dangoIPFS_RPC.stats.bw({poll: true})){
      console.log(bandwith)
    }

  } catch (err) {
    console.log('Error fetching file from IPFS:', err);
  }
  }
  
  </script>
  
  <style scoped lang="scss">
  
  
  
  </style>
  