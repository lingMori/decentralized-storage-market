import axios from "axios";
import type { IpfsConfig, IpfsCreateKeyResult, IpfsKeyConfig, IpfsKeyCreateResponse } from "./ipfsClient.type";

const defaultKeyConfig: Partial<IpfsKeyConfig> = {
    type: 'ed25519',
    ipnsBase: 'base36'
  };

export const genKeyInIPFS = async(keyConfig:IpfsKeyConfig, ipfsConfig:IpfsConfig): Promise<IpfsCreateKeyResult> => {

    const mergedKeyConfig = {...defaultKeyConfig, ...keyConfig};

    if (keyConfig.arg.length === 0) {
        throw new Error("Key name cannot be null")
    }
    
    try {
        const response = await axios.post(`${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}/api/v0/key/gen`, null, {
            params: {
                arg: mergedKeyConfig.arg,
                type: mergedKeyConfig.type,
                size: mergedKeyConfig.size,
                'ipns-base': mergedKeyConfig.ipnsBase 
            }
        });
        const keyNodeInfo = response.data as IpfsKeyCreateResponse;

        return keyNodeInfo

    }catch(error) {
        console.error('Error occured when creaete key in IPNS:', error);
        // return { error: `Unexpected error occurred: ${error}` } as IpfsKeyCreateError;
        throw new Error(`Unexpected error occurred: ${error}`)
    }
}