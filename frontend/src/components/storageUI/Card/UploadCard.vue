<template>
    <section id="panel-upload">
        <div class="content panel-upload--content">
            <div class="panel-upload--dropzone" :class="{active:isDragged}"
                 @dragenter="onDragEnter"
                 @dragleave="onDragLeave"
                 @dragover.prevent
                 @drop.prevent="onDropHandler">
                 <input type="file" multiple ref="fileRef" @change="onFileChangeHandler"/>
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
    <Dialog :open="!hasLogin" @update:open="(val) => hasLogin = !val">
      <DialogContent v-on:interact-outside="(e: Event) => {e.preventDefault()}">
        <Card class="w-full max-w-md mx-auto border-0 shadow-none">
          <CardHeader>
            <CardTitle class="text-2xl font-bold text-center">欢迎来到 InstaShare</CardTitle>
            <CardDescription class="text-center">
              请选择您喜欢的登录方式继续
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs default-value="wallet" class="w-full">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">Web3 钱包</TabsTrigger>
                <TabsTrigger value="social">社交账号</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet" class="space-y-4">
                <div class="grid gap-4 mt-4">
                  <Button class="w-full h-12  bg-orange-600  hover:bg-orange-600  text-white border-none transition-all duration-300 group relative overflow-hidden" 
                          variant="outline" 
                          @click="connectWallet">
                    <Wallet class="mr-2 h-5 w-5" />
                    连接 MetaMask
                  </Button>
                  <Button class="w-full h-12" variant="outline" >
                    <Globe class="mr-2 h-5 w-5" />
                    连接 WalletConnect
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="social" class="space-y-4">
                <div class="grid gap-4 mt-4">
                  <Button class="w-full h-12" variant="outline" >
                    <Mail class="mr-2 h-5 w-5" />
                    邮箱登录
                  </Button>
                  <Button class="w-full h-12" variant="outline" >
                    <Globe class="mr-2 h-5 w-5" />
                    Google 登录
                  </Button>
                  <Button class="w-full h-12" variant="outline" >
                    <Laptop class="mr-2 h-5 w-5" />
                    Apple 登录
                  </Button>
                  <Button class="w-full h-12" variant="outline">
                    <GithubIcon class="mr-2 h-5 w-5" />
                    Github 登录
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center">
                <Separator class="w-full" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">
                  或者
                </span>
              </div>
            </div>

            <Button 
              class="w-full " 
              variant="default"
              @click="registeInsta"
            >
              现在加入InstaShre网络
            </Button>
          </CardContent>
  </Card>
      </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import Button from '@/components/ui/button/Button.vue';
import {
  Wallet,
  Mail,
  Github as GithubIcon,
  Globe,
  Laptop
} from 'lucide-vue-next'

import useLocalStorage from '@/store/localStorageDB';
import type { AddResult, KuboRPCClient } from 'kubo-rpc-client';
import { formatFileSize } from '@/lib/data-tools/dataFormer';
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type';
import { useWeb3ModalAccount, useWeb3Modal } from '@web3modal/ethers5/vue';
import { useInstaShareContract } from '@/lib/contract-interact/useContract';
import { accountRepo } from '@/lib/contract-interact/accountRepp';


const localStore = useLocalStorage();
const {isConnected} = useWeb3ModalAccount();
const {open, close} = useWeb3Modal();

const {getSigner} = useInstaShareContract();
const {register, checkRegistrationStatus} = accountRepo();


const isDragged = ref<boolean>(false);
const isUploading = ref<boolean>(false);
const isUploaded = ref<boolean>(false);
const finished = ref<number>(0);
const hasRegisted = ref<boolean>(true)
const hasLogin = ref<boolean>(true);
const fileRef = ref<HTMLInputElement | null>(null);
const ipfsClient = inject('dangoRPC') as KuboRPCClient;

onMounted(async () => {
  hasLogin.value = checkLogin()
  hasRegisted.value = await checkRegister()
})


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
    try {
        const response: AddResult = await ipfsClient.add(file);
        return {
            name: file.name,
            cid: response.cid.toString(),
            status: 'active',
            lastModified: file.lastModified.toString(),
            size: file.size.toString(),
            type: file.type
        } as FileItem;
    } catch (error) {
        console.log('upload file error', error);
        return {} as FileItem; // Return empty object if error occurs
    } finally {
        finished.value++;
    }
};

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

    return isRegistered;

  }catch (error) {
    console.log('register configration error: ', error)
  }
  return false; // Ensure a boolean is always returned
}

const connectWallet = async () => {
  await open(); // 等待 open 完成
  while (!isConnected.value) {
      console.log("waiting for connect");
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 0.5 秒
  }
};

const registeInsta = async () => {
  try {
    if (!checkLogin()) {
      await connectWallet(); // 直接等待连接完成
      const signer = getSigner();
      const address = await signer.getAddress();
      const response = await register();
      console.log(response);
    }
  } catch (error) {
    console.log("registration error: ", error); // 更具体的错误信息
  }
};


const onFileChangeHandler = async() => {
  
    isUploading.value = true;
    // const uploadFileHander:Promise<IpfsUploadResult>[] = [];
    
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
          // console.log(localStorage.getItem("storageApp"))
          // localStore.clearCache();
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