<template>
    <p style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5 file-input">
        <Input type="file" class="input-box" @change="handleFiles" />
        <Button :data-state="isOpen" :class="isOpen ? 'button-style' : ''" @click="uploadToIPFS">
            <span class="text-color">Upload to IPFS</span>
        </Button>
      </div>
    </p>
  
    <p style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5">
        <Input id="keyNode" type="text" placeholder="input your key name" v-model="keyName" />
        <Button type="submit" @click="addKeyNode">
          Add KeyNode
        </Button>
    </div>
    </p>
  
    <p style="padding: 10px;">
      <div class="flex w-full max-w-sm items-center gap-1.5">
        <Input id="nodeName" type="text" placeholder="input your Node name" v-model="nodeName" />
        <Button type="submit" @click="addNodeName">
          Publish Name Node
        </Button>
      </div>
    </p>
  </template>
  
  <script setup lang="ts">

  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { inject, ref } from 'vue';
  import createHeliaFile from '@/lib/ipfs-client/helia-server/core/heliaFile';
  import type { Helia } from '@helia/http';

  const files = ref<File[]>([]);
  const isOpen = ref<boolean>(true)
  const keyName = ref('')
  const nodeName = ref('')

  const heliaFS = createHeliaFile(inject('heliaClient') as Promise<Helia>)

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
      const formData = new FormData();
      formData.append('file', files.value[0]);
      const response = await (await heliaFS).addFile({
        content: new Uint8Array(await files.value[0].arrayBuffer()), // Convert File to Uint8Array
        path: files.value[0].name,
      });

      console.log(response.toString())

    }catch (e) {
      console.log(e)
    }
  }
  
  </script>
  
  <style scoped lang="scss">
  
  
  
  </style>
  