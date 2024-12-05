// useFileUpload.ts
import { ref } from 'vue';
import { BigNumber } from 'ethers';
import type { AddResult } from 'kubo-rpc-client';
import { fileRepo } from '@/lib/contract-interact/fileRepo';
import { toast } from 'vue-sonner';
import { formatDate } from '@/lib/data-tools/dataFormer';
import { CheckCircle2, XCircle } from 'lucide-vue-next'; // Import XCircle for error toast
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue';
import useLocalStorage from '@/store/localStorageDB';
import type { KuboRPCClient } from 'kubo-rpc-client';
import { inject } from 'vue';
import type { FileItem } from '../ipfs-client/dango-ipfs-ts/types/dango.type';

export const useFileUpload = () => {
  const { isConnected } = useWeb3ModalAccount();
  const localStore = useLocalStorage();
  const isUploading = ref(false);
  const finished = ref(0);
  const fileRef = ref<HTMLInputElement | null>(null);
  const ipfsClient = inject('dangoRPC') as KuboRPCClient;

  const uploadFileHandler = async (file: File) => {
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
      // Show error toast for IPFS upload failure
      toast.error('文件上传失败：IPFS 上传出错', {
        description: `文件 ${file.name} 上传失败，请重试。`,
        style: {
          background: 'linear-gradient(145deg, #f56565 0%, #e53e3e 100%)',// 柔和的红色
          color: 'white',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        icon: XCircle,
        duration: 4000,
        position: 'bottom-center',
      });
      return {} as FileItem;
    }

    try {
      responseChain = await uploadFile({
        cid: responseIPFS.cid.toString(),
        fileName: file.name,
        fileSize: BigNumber.from(file.size),
        fileType: file.type,
      });

      toast('文件添加成功', {
        description: `文件 ${file.name} 上传于 ${formatDate(file.lastModified)}`,
        style: {
          background: 'linear-gradient(145deg, #48bb78 0%, #38a169 100%)',
          color: 'white',
          fontWeight: '600',
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: '0 8px 20px rgba(0, 180, 219, 0.3), 0 4px 10px rgba(0, 131, 176, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        },
        action: {
          label: '知悉',
          onClick: () => {
            console.log('Undo');
          },
          style: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '8px',
            padding: '6px 12px',
            fontWeight: '600',
            marginLeft: '12px',
            transition: 'background-color 0.3s ease',
          },
        },
        icon: CheckCircle2,
        duration: 4000,
        position: 'bottom-center',
      });
    } catch (error) {
      console.log('Chain upload error:', error);
      // Show error toast for chain upload failure
      // 错误上传后的 toast
      toast.error('文件上传失败：链上上传出错', {
        description: `文件 ${file.name} 上传失败，请稍后重试。`,
        style: {
          background: 'linear-gradient(145deg, #f56565 0%, #e53e3e 100%)', // 柔和的红色
          color: 'white',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        icon: XCircle,
        duration: 4000,
        position: 'bottom-center',
      });

      try {
        await ipfsClient.pin.rm(responseIPFS.cid);
        for await (const res of ipfsClient.repo.gc()) {
          console.log(res);
        }
        console.log(`File with CID ${responseIPFS.cid.toString()} has been unpinned from IPFS.`);
      } catch (error) {
        console.log('IPFS remove error:', error);
      }
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
      type: file.type,
    } as FileItem;
  };

  const onFileChangeHandler = async () => {
    if (!isConnected.value) {
      return;
    }

    isUploading.value = true;
    if (fileRef.value?.files) {
      const files: FileList = fileRef.value.files;
      localStore.addFiles(files);

      const handlers = localStore.files.map((file) => uploadFileHandler(file));

      try {
        const results = await Promise.all(handlers);
        localStore.addResults(results);
        localStore.resetFiles();
      } catch (error) {
        console.log(error);
      } finally {
        finished.value = 0;
        isUploading.value = false;
        fileRef.value.value = '';
      }
    }
  };

  return {
    isUploading,
    finished,
    fileRef,
    onFileChangeHandler,
  };
};
