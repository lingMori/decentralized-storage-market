import type { BigNumber } from "ethers";
import { useInstaShareContract } from "./useContract";

interface FileRepoResponse {
  success: boolean;
  error?: string;
}

export interface FileObject {
  cid: string,
  fileSize: BigNumber,
  fileType: string,
  fileName: string
}

export const fileRepo = (): {
  uploadFile: (file: FileObject) => Promise<FileRepoResponse>;
  removeFile: (file: FileObject) => Promise<FileRepoResponse>;
} => {

  const { getContract } = useInstaShareContract();

  const uploadFile = async (file: FileObject):Promise<FileRepoResponse> => {
    try {
      const contract = getContract();
      // console.log("file uploaded", file); // test file object
      const tx = await contract.uploadFile(file.cid, file.fileSize, file.fileType, file.fileName); // 确保等待交易完成
      await tx.wait();
      return { success: true } as FileRepoResponse;
    } catch (error: any) {
      // console.log(error);
      if (error.data.code === 4001) { // 直接检查 error.code
        return { success: false, error: '用户拒绝了交易' } as FileRepoResponse;
      }
    }
    return { success: false, error: '上传失败，请稍后重试' } as FileRepoResponse;
  }

  const removeFile = async (file: FileObject):Promise<FileRepoResponse> => {
    try {
      const contract = getContract();
      const tx = await contract.removeFile(file.cid); // 确保等待交易完成
      await tx.wait();
      return { success: true } as FileRepoResponse;
    } catch (error: any) {
      if (error.data.code === 4001) { // 直接检查 error.code
        return { success: false, error: '用户拒绝了交易' } as FileRepoResponse;
      }
    }
    return { success: false, error: '删除失败，请稍后重试' } as FileRepoResponse;
  }


  return {
    uploadFile,
    removeFile
  }

}
