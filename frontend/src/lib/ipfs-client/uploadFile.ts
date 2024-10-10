import axios from "axios";
import type { IpfsConfig, IpfsResponseData, IpfsResponseDataObject, IpfsUploadResult } from "./ipfsClient.type";


export const uploadFileToIPFS = async(file: File, config: IpfsConfig): Promise<IpfsUploadResult> => {
    if (file === null){
        // return {error: "no file been uploaded !"} as IpfsUploadError
        throw new Error("no file been uploaded !")
    }

    const formData: FormData = new FormData();
    formData.append(file.name, file, file.webkitRelativePath);

    try {

        const response = await axios.post(`${config.protocol}://${config.host}:${config.port}/api/v0/add`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        const rawData = response.data;
        const fileCid:IpfsResponseData = rawData as IpfsResponseDataObject;

        return fileCid;

    }catch(error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error(`Error uploading to IPFS: ${error}`)
    }
}