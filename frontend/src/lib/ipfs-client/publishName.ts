import axios from "axios";
import type { IpfsConfig, IpfsNamePublishResponse, keyType } from "./ipfsClient.type";


export const publishNametoIpfs = async(key:keyType, cid:string, config:IpfsConfig):Promise<IpfsNamePublishResponse> => {                                     

    try {

        const res = await axios.post(`${config.protocol}://${config.host}:${config.port}/api/v0/name/publish`, null, {
            params: {
                arg: `/ipfs/${cid}`,
                key: key.Name
            }
        })

        console.log(`Published ${cid} to IPNS with key ${key}`);

        return res.data as IpfsNamePublishResponse;

    } catch (error) {
        console.error('Error publishing to IPNS:', error);
        throw new Error(`Error publishing to IPNS: ${error}`);
    }
}