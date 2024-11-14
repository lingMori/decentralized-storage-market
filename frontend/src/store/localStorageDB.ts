import { defineStore } from "pinia";
import Storage from "@/lib/local-storage/storage";
import { ref } from "vue";
import type { FileItem } from "@/lib/ipfs-client/dango-ipfs-ts/types/dango.type";

const localStorageDB = new Storage("storageApp"); // localStorageDB is a typescript class

localStorageDB.read();
localStorageDB.data ||= { version:"0.0.1", results: []}


const useLocalStorage = defineStore('store',() => {
    const files = ref<File[]>([])
    const results = ref<FileItem[]>(localStorageDB.data.results)

    const resetFiles = () => {
        files.value = []
    }
    const addFiles = (newFiles:FileList) => {
        files.value.push(...newFiles);
    }

    const isIpfsResponseDataObject = (data: FileItem): data is FileItem => {
        return (data as FileItem).cid !== undefined;
      };

    const addResults = (newResults:FileItem[]) => {
        // results.value.push(...newResults);
        const filteredResults = newResults.filter((newResult) :newResult is FileItem => 
            isIpfsResponseDataObject(newResult) &&
            !results.value.some((existingResult) => existingResult.cid === newResult.cid)
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
