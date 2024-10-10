import axios from "axios";
import type { IpfsConfig, IpfsResponseData, IpfsResponseDataObject, IpfsUploadResult } from "./ipfsClient.type";

export const uploadFolderToIPFS = async(folder: File[], config:IpfsConfig) : Promise<IpfsUploadResult> => {
    if (folder.length === 0) {
        // alert("please select a folder frist !");
        // return { error: 'No files selected' } as IpfsUploadError;
        throw new Error('No files selected');
    }

    const formData: FormData = new FormData(); 
    folder.forEach(file => {
        formData.append(file.name, file, file.webkitRelativePath);
    })

    try {
        const response = await axios.post(`${config.protocol}://${config.host}:${config.port}/api/v0/add`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
              }
        })
        const rawData:string = response.data;
        const lines:string[] = rawData.split("\n")

        const folderCids:IpfsResponseData = lines
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line) as IpfsResponseDataObject;
                  } catch (e) {
                    console.error('Error parsing JSON:', e, 'Line content:', line);
                    return null;
                  }
            })
            .filter((item): item is IpfsResponseDataObject => item !== null); // Filter out null values
            
        // folderCids.forEach(Flevel => {
        //     console.log(`file level is: ${Flevel.Name}\t cid:${Flevel.Hash}\t in size:${Flevel.Size}`)
        // })

        return folderCids;

    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        // return { error: `Unexpected error occurred: ${error}` } ;
        throw new Error(`Unexpected error occurred: ${error}`)
    }
}