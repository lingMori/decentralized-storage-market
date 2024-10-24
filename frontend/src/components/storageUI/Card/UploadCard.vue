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
    <Teleport to="body">
    <Dialog :open="!hasRegisted" @update:open="(val) => hasRegisted = !val">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>这是一个弹窗测试</DialogTitle>
          <DialogClose @click="closeDialog" />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import useLocalStorage from '@/store/localStorageDB';
import type { AddResult, KuboRPCClient } from 'kubo-rpc-client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { formatFileSize } from '@/lib/data-tools/dataFormer';
import { Teleport } from 'vue';
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type';

const localStore = useLocalStorage();

const isDragged = ref<boolean>(false);
const isUploading = ref<boolean>(false);
const isUploaded = ref<boolean>(false);
const finished = ref<number>(0);

const hasRegisted = ref(false)

const closeDialog = () => {
  hasRegisted.value = false
}

const fileRef = ref<HTMLInputElement | null>(null);
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

const ipfsClient = inject('dangoRPC') as KuboRPCClient;

const onDragEnter = () => {
    isDragged.value = true;
}

const onDragLeave = () => {
    isDragged.value = false;
}

const openSelectFile = () => {
      if (isUploading.value) return false;

      fileRef.value?.click()
}

const onDropHandler = (event:DragEvent) => {
    isDragged.value = false;
    if (event.dataTransfer?.files) {
        const files:FileList = event.dataTransfer.files;
        console.log(files);
    }
}

const uploadFileHandler = async(file:File):Promise<FileItem> => {
  try {
    const response:AddResult = await ipfsClient.add(file);
    const filePackage:FileItem = {
      name: file.name,
      cid: response.cid.toString(),
      status: 'active',
      lastModified: file.lastModified.toString(),  // Use `file.lastModified`
      size: file.size.toString(),                 // Use `file.size`
      type: file.type                             // Use `file.type`
    } as FileItem

    return filePackage;

  } catch (error) {
    console.log('upload file error', error);
  }

  finished.value++;
  return {} as FileItem;  // Return empty object if error occurs
}

const onFileChangeHandler = async() => {
    isUploading.value = true;
    // const uploadFileHander:Promise<IpfsUploadResult>[] = [];
    
    if (fileRef.value?.files) {
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
          console.log(localStorage.getItem("storageApp"))
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