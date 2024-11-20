<template>
    <section id="panel-upload">
        <div class="content panel-upload--content">
            <div class="panel-upload--dropzone" :class="{active:isDragged}"
                 @dragenter="onDragEnter"
                 @dragleave="onDragLeave"
                 @dragover.prevent
                 @drop.prevent="onDropHandler">
                 <input type="file" ref="fileRef" @change="onFileChangeHandler"/>
                 <div class="dropzone-label" @click="openSelectFile">
                    <i-mdi-timer-sand v-if="(fileCount > 0)" class="icon-color" />
                    <i-mdi-upload v-else class="icon-color" />

                    <span>Drop files here or click to select files.</span>
                    
                    <div class="dropzone-is-loading" :class="{ active: (fileCount > 0) }">
                        <div class="dropzone-loading--bar"></div>
                    </div>
                    <span v-show="(fileCount > 0)">{{ (fileCount - finished) }} of {{ fileCount }} files being transfered.</span>
                    </div>

                    <div class="dropzone-details">
                    <div class="dropzone-detail">{{ result.count }} files</div>
                    <div class="dropzone-detail">{{ formatFileSize(String(result.size)) }}</div>
                    </div>
                </div>
        </div>
    </section>
    <RegisterDialog :is-logged-in="hasLogin" v-on:update:is-logged-in="updateLoginStatus"/>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import RegisterDialog from '../Dialog/RegisterDialog.vue';

import useLocalStorage from '@/store/localStorageDB';
import type { AddResult, KuboRPCClient } from 'kubo-rpc-client';
import { formatFileSize } from '@/lib/data-tools/dataFormer';
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type';
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue';
import { useInstaShareContract } from '@/lib/contract-interact/useContract';
import { accountRepo } from '@/lib/contract-interact/accountRepp';
import timeLaster from '@/lib/data-tools/timeLaster';
import { fileRepo } from '@/lib/contract-interact/fileRepo';
import { BigNumber } from 'ethers';
import type { File as GraphQLFile } from '@/lib/contract-interact/graphSQL/types/types';
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient';
import { SUBGRAPH_API } from '@/configs/SUBGRAPH_API';
import { findFilesbyAddr } from '@/lib/contract-interact/graphSQL/temp/findFilesbyAddr';


const localStore = useLocalStorage();
const {isConnected, address} = useWeb3ModalAccount();

const {getSigner} = useInstaShareContract();
const {checkRegistrationStatus} = accountRepo();

const isFileInited = ref<boolean>(false);
const isDragged = ref<boolean>(false);
const isUploading = ref<boolean>(false);
const isUploaded = ref<boolean>(false);
const finished = ref<number>(0);
const hasRegisted = ref<boolean>(true);
const hasLogin = ref<boolean>(true);
const fileRef = ref<HTMLInputElement | null>(null);
const ipfsClient = inject('dangoRPC') as KuboRPCClient;

onMounted(async () => {
  hasLogin.value = checkLogin();
  while (!hasLogin.value) {
    hasLogin.value = checkLogin();
    if (!hasLogin.value) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  while (!hasRegisted.value) {
    hasRegisted.value = await checkRegister();
    if (!hasRegisted.value) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!hasRegisted.value) {
    return; // Exit if not registered
  }

  await loadFilesFromGraph();
})

const updateLoginStatus = (value: boolean) => {
  hasLogin.value = value;
};

const loadFilesFromGraph = async () => {
  localStore.clearCache();
  try {
    const graphqlClient = createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value));
    const result = await graphqlClient as {files: GraphQLFile[]};
    const fileList: FileItem[] = result.files.map(file => {
      return {
        name: file.fileName,
        cid: file.cid,
        status: `${file.isActive? 'active': 'false'}`,
        lastModified: file.lastUpdated.toString(),
        size: file.size.toString(),
        type: file.fileType
      } as FileItem;
    })
    // console.log('hhhhhhh')
    localStore.addResults(fileList);
  }catch (e) {
    console.log(e)
  }
}


const fileCount = computed(() => {
  return localStore.files.length;
})

const result = computed(() => {
  return {
    count: localStore.results.length,
    size: localStore.results.reduce((sum, result) => {
      return sum + Number((result as FileItem).size);
    }, 0)
  }
})

const onDragEnter = () => {isDragged.value = true;}
const onDragLeave = () => {isDragged.value = false;}
const openSelectFile = () => {if (isUploading.value) return false; fileRef.value?.click()}

const onDropHandler = (event:DragEvent) => {
    isDragged.value = false;
    if (event.dataTransfer?.files) {
      const files: FileList = event.dataTransfer.files;
        localStore.addFiles(files);
        onFileChangeHandler(); // Trigger file change handler
    }
}

const uploadFileHandler = async (file: File): Promise<FileItem> => {
    if (!file) {
        console.log('File is null or undefined');
        return {} as FileItem;
    }

    const { uploadFile } = fileRepo();
    let responseIPFS: AddResult;
    let responseChain;

    try {
        responseIPFS = await ipfsClient.add(file);
    } catch (error) {
        console.log('IPFS upload error:', error);
        return {} as FileItem;
    }

    try {
        responseChain = await uploadFile({
            cid: responseIPFS.cid.toString(),
            fileName: file.name,
            fileSize: BigNumber.from(file.size),
            fileType: file.type
        });
    } catch (error) {
        console.log('Chain upload error:', error);
        return {} as FileItem;
    } finally {
        finished.value++;
    }

    return {
        txResult: responseChain,
        name: file.name,
        cid: responseIPFS.cid.toString(),
        status: 'active',
        lastModified: file.lastModified.toString(),
        size: file.size.toString(),
        type: file.type
    } as FileItem;
}

const checkLogin = ():boolean => {
  try {
    const status:boolean = isConnected.value? true: false;
    return status

  }catch (error) {
    console.log('register configration error: ', error)
  }
  return false
}

const checkRegister = async ():Promise<boolean> => {

  try{
    const address = await getSigner().getAddress()
    const {isRegistered} = await checkRegistrationStatus(address)
    console.log("has registered: ", isRegistered)
    return isRegistered;

  }catch (error) {
    console.log('register configration error: ', error)
  }
  return false; // Ensure a boolean is always returned
}

const onFileChangeHandler = async() => {
  
    isUploading.value = true;
    
    if (fileRef.value?.files) {
        if (!checkLogin()) {
          hasLogin.value = false
          fileRef.value.value = ""
          isUploading.value = false;
          return;
        }
        const files:FileList = fileRef.value?.files;
        localStore.addFiles(files);   
    
        const handlers = localStore.files.map(file => uploadFileHandler(file));

        try {
          // await timeLaster(1000)
          let results = await Promise.all(handlers);
          localStore.addResults(results);
          localStore.resetFiles();

          fileRef.value.value = "";

        }catch(error) {
          console.log(error)
        }finally {
          finished.value = 0;
          isUploading.value = false;
          fileRef.value.value = ""
        }
    }
}


</script>

<style scoped lang="scss">
section#panel-upload {
  background-color: var(--gradient-100);
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;

  .panel-upload--content,
  .panel-upload--content .panel-upload--dropzone {
    width: 100%;
    height: 100%;
  }

  .panel-upload--dropzone {
    position: relative;
    cursor: pointer;
    overflow: hidden;

    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;

    &.active {
      > * {
        pointer-events: none;
      }

      .dropzone-label {
        background-color: rgba(0, 0, 0, .2);
      }
    }

    input {
      display: none;
    }
    .dropzone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: .8rem;
      border-radius: .5rem;
      text-align: center;
      width: 80%;

      svg {
        height: 48px;
        width: 48px;
        margin-bottom: 1rem;
      }

      span {
        font-size: 0.8rem;
      }
    }
    .dropzone-details {
      position: absolute;
      display: flex;

      bottom: 1rem;
      left: 1rem;

      .dropzone-detail {
        background-color: var(--gradient-300);
        border-radius: 1rem;
        padding: .4rem .8rem;
        font-size: .8rem;
        margin-right: .6rem;
      }
    }

    .dropzone-is-loading {
      opacity: 0;

      position: relative;
      height: 4px;
      display: block;
      width: 150px;
      background-color: var(--gradient-300);
      border-radius: 2px;
      margin: 1rem 0 1rem 0;
      overflow: hidden;

      &.active {
        opacity: 1;
      }

      .dropzone-loading--bar {
        background-color: var(--gradient-800);

        &:before {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        &:after {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
          animation-delay: 1.15s;
        }
      }
    }
  }
}

body.dark-theme {
  section#panel-upload {
    background-color: var(--gradient-800);

    .dropzone-details .dropzone-detail {
      background-color: var(--gradient-900);
    }
    .dropzone-is-loading {
      background-color: var(--gradient-700);

      .dropzone-loading--bar {
        background-color: var(--icon-color);
      }
    }
  }
}

@keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}
</style>
