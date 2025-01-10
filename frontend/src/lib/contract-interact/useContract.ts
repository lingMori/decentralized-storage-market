import { ethers } from "ethers";
import instaABI from "../../../../contract/data-market/abi/InstaShare_v2.json"
import { contractAddress } from "@/configs/CONTRACT_ADDRESS";
import type { InstaShareHook, InstaShareContract } from "./type";

export const useInstaShareContract = (): InstaShareHook => {
    const contract_address = contractAddress;
    const INSTAabi = instaABI;
    
    const getSigner = ():ethers.Signer => {
        if (!window.ethereum) {
            throw new Error("Ethereum provider is not available");
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return signer;
    }

    const getContract = ():InstaShareContract => {
        const signer = getSigner();
        const contract = new ethers.Contract(contract_address, INSTAabi, signer) as InstaShareContract;
        return contract;
    }

    return {
        getSigner,
        getContract
    }
}
