<template>
  <section id="content" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
    <div class="main">
      <div class="sidebar">
        <StorageSidebar 
          :is-loading="isLoading" 
          :user="userStorage || { totalStorage: 100, usedStorage: 0 }"
        />
      </div>
      <div class="main-content">
        <div class="header-actions">
          <ServerSelectMenu @server-selected="handleServerChange" />
          <div class="action-buttons">
            <Button variant="outline" size="sm">
              <UploadCloud class="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 class="w-4 h-4 mr-2" />
              Remove Files
            </Button>
          </div>
        </div>
        <div :style="{ height: `calc(100vh - ${headerHeight}px - 90px)`}">
          <BoxCard :server-id="selectedServerId" @update-files="loadFilesFromGraph"/>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import BoxCard from '@/components/storageUI/Card/BoxCard.vue'
import { Button } from '@/components/ui/button'
import StorageSidebar from '@/components/storageUI/Sidebar/StorageSidebar.vue'
import ServerSelectMenu from '@/components/storageUI/Menu/ServerSelectMenu.vue'
import { UploadCloud, Trash2 } from 'lucide-vue-next'
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient'
import { SUBGRAPH_API } from '@/configs/SUBGRAPH_API'
import type { FileItem } from '@/lib/ipfs-client/dango-ipfs-ts/types/dango.type'
import { findUserbyAddr } from '@/lib/contract-interact/graphSQL/temp/findUserbyAddr'
import { findFilesbyAddr } from '@/lib/contract-interact/graphSQL/temp/findFilesbyAddr'
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue'
import type { User as GraphQLUser, File as GraphQLFile} from '@/lib/contract-interact/graphSQL/types/types'
import useLocalStorage from '@/store/localStorageDB'
// Define props interface
interface UserStorage {
   totalStorage: number;
   usedStorage: number;
}

const headerHeight = ref(0)
const selectedServerId = ref<string | null>(null)
const { address } = useWeb3ModalAccount()
const isLoading = ref<boolean>(true)
  const localStore = useLocalStorage()
const userStorage = ref<UserStorage>({
   totalStorage: 100,
   usedStorage: 0
})

// 获取header高度的函数
const updateHeaderHeight = () => {
 const header = document.querySelector('header')
 if (header) {
   headerHeight.value = header.offsetHeight
 }
}

// 处理服务器选择
const handleServerChange = (server: any) => {
 selectedServerId.value = server.id
 // 这里可以触发BoxCard组件重新加载对应服务器的文件
}

const loadUserInfoFromGraph = async() => {
 try {
   isLoading.value = true
   const graphqlClient = await createGraphqlClient(SUBGRAPH_API, findUserbyAddr(address.value))
   const result = await graphqlClient as {user: GraphQLUser}

   const graphqlClient2 = await createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value))
    const result2 = await graphqlClient2 as {files: GraphQLFile[]}

    // 查询所有文件并统计大小：
    const totalSize = result2.files.reduce((acc, cur) => acc + Number(cur.size), 0)

   // 更新用户存储信息
   userStorage.value = {
     totalStorage: Number(result.user.maxLoad )|| 0,
     usedStorage: totalSize || 0 // 假设GraphQLUser有usedStorage字段
   }
   
   isLoading.value = false
 } catch (error) {
   console.error('Error loading user info:', error)
   isLoading.value = false
   
   // 设置默认值
   userStorage.value = {
     totalStorage: 0,
     usedStorage: 0
   }
 }
}

const loadFilesFromGraph = async () => {
  localStore.clearCache();
  try {
    const graphqlClient = createGraphqlClient(SUBGRAPH_API, findFilesbyAddr(address.value));
    const result = await graphqlClient as {files: GraphQLFile[]};
    const fileList: FileItem[] = result.files.map(file => {
      return {
        name: file.fileName,
        cid: file.cid,
        status: `${file.isActive? 'active': 'removed'}`,
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


// 监听窗口大小变化，更新高度
const handleResize = () => {
 updateHeaderHeight()
}

// 监听地址变化，重新加载用户信息
watch(() => address.value, () => {
 if (address.value) {
   loadUserInfoFromGraph()
 }
}, { immediate: true })

onMounted(async() => {
 updateHeaderHeight()
 await loadFilesFromGraph()
 window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
 window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
section#content {
 position: relative;
  
 .main {
   display: flex;
   height: 100%;
    
   .sidebar {
     flex-shrink: 0;
     height: 100%;
   }
    
   .main-content {
     flex: 1;
     display: flex;
     flex-direction: column;
     padding: 1.5rem;
     height: 100%;
     overflow: hidden;
      
     .header-actions {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 1rem;
       gap: 1rem;
        
       .action-buttons {
         display: flex;
         gap: 0.75rem;
       }
     }
   }
 }
}

// 响应式设计
@media (max-width: 768px) {
 .main {
   .main-content {
     width: 100%;
     padding: 1rem;
      
     .header-actions {
       flex-direction: column;
       align-items: stretch;
     }
   }
 }
}
</style>
