import { defineStore } from "pinia";
import Storage from "@/lib/local-storage/storage";
import { ref } from "vue";
import type { IpfsResponseData, IpfsResponseDataObject } from "@/lib/ipfs-client/ipfsClient.type";


const localStorageDB = new Storage("storageApp");

localStorageDB.read();
localStorageDB.data ||= { version:"0.0.1", results: []}


const useLocalStorage = defineStore('store',() => {
    const files = ref<File[]>([])
    const results = ref<IpfsResponseDataObject[]>(localStorageDB.data.results)

    const resetFiles = () => {
        files.value = []
    }
    const addFiles = (newFiles:FileList) => {
        files.value.push(...newFiles);
    }

    const isIpfsResponseDataObject = (data: IpfsResponseData): data is IpfsResponseDataObject => {
        return (data as IpfsResponseDataObject).Hash !== undefined;
      };

    const addResults = (newResults:IpfsResponseData[]) => {
        // results.value.push(...newResults);
        const filteredResults = newResults.filter((newResult) :newResult is IpfsResponseDataObject => 
            isIpfsResponseDataObject(newResult) &&
            !results.value.some((existingResult) => existingResult.Hash === newResult.Hash)
        );
        results.value.push(...filteredResults)
        localStorageDB.data.results = [...results.value];
        localStorageDB.write();
    }

    const clearCache = () => {
        files.value = [];
        results.value = [];

        // 更新 localStorageDB 数据并写回 localStorage
        localStorageDB.data.results = [];
        localStorageDB.write();
    }

    return {files, results, resetFiles, addFiles, addResults, clearCache};
})

export default useLocalStorage;
