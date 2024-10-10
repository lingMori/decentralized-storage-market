import axios, {AxiosError} from "axios";
import type { IpfsConfig, IpfsCreateKeyResult, IpfsKeyConfig, IpfsKeyCreateResponse, IpfsPublishNameResult, IpfsUploadResult, keyType, nameType } from "./ipfsClient.type";
import { uploadFolderToIPFS } from "./uploadFolder";
import { uploadFileToIPFS } from "./uploadFile";
import { genKeyInIPFS } from "./genKey";
import { publishNametoIpfs } from "./publishName";

class IpfsClient {
    private config:IpfsConfig;

    constructor(_config: IpfsConfig) {
        this.config = _config
    }

    /**
     * uploadFolder
     */
    public async uploadFolder(folder: File[]): Promise<IpfsUploadResult> {
        return uploadFolderToIPFS(folder, this.config);
    }

    /**
     * uploadFile
    */
    public uploadFile(file: File): Promise<IpfsUploadResult> {
        return uploadFileToIPFS(file, this.config);
    }

    /**
     * 
     */
    public createKey(keyConfig: IpfsKeyConfig): Promise<IpfsCreateKeyResult> {
        return genKeyInIPFS(keyConfig, this.config);
    }

    /**
     * publishName
     */
    public publishName(key: keyType, cid:string): Promise<IpfsPublishNameResult> {
        return publishNametoIpfs(key, cid, this.config);
    }
}

export default IpfsClient;