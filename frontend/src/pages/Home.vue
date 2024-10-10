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
  
  import { ref } from 'vue';
  import IpfsClient from '@/lib/ipfs-client/ipfsClient';
  import type { IpfsCreateKeyResult, IpfsKeyCreateResponse, IpfsNamePublishResponse, IpfsUploadResult, keyType } from '../lib/ipfs-client/ipfsClient.type';
  
  const files = ref<File[]>([]);
  const isOpen = ref<boolean>(true)
  const keyName = ref('')
  const nodeName = ref('')
  
  const IPFS_Client = new IpfsClient({
      protocol:"http",
      host:"123.157.213.102",
      port:'39761'
  })
  
  const handleFiles = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      files.value = Array.from(input.files);
    }
  };
  
  const addKeyNode = async() => {
    if (keyName.value === '') {
      alert('key name cannot be empty');
      return;
    }
    // Add your logic here for adding the key node
    try {
      const res:IpfsCreateKeyResult = await IPFS_Client.createKey({arg:keyName.value});
  
      console.log(res.Id)
      console.log(res.Name)
  
    }catch(error) {
      console.log(error)
    }
    
  }
  
  const addNodeName = async() => {
    try {
      const keyNode:keyType = {
        Id:"k51qzi5uqu5dm8sgsh63q8akacwm60mpcdumjy8qml1wxq7dbmkm4qh2zxuuyn",
        Name: nodeName.value
      }
      const cid:string = "QmaSyMrhp7Y1bgw5hRDCzwLMgf6piNhawkkVpwUgZ94d3Q"
      const res:IpfsNamePublishResponse = await IPFS_Client.publishName(keyNode, cid)
      console.log(res)
  
    }catch (error) {
      console.log(error)
    }
  }
  
  
  const uploadToIPFS = async() => {
    const cids:IpfsUploadResult = await IPFS_Client.uploadFile(files.value[0]);
    if (Array.isArray(cids)) {
      for (const cid of cids){
        console.log(cid)
      }
    }else {
      console.log(cids.Hash)
    }
  }
  
  </script>
  
  <style scoped lang="scss">
  
  
  
  </style>
  