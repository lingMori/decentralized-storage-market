import { ethers } from "ethers";
import instaABI from "../../../../contract/data-market/abi/InstaShare.json"
import { contractAddress } from "@/configs/CONTRACT_ADDRESS";

export const useInstaShareContract = (): { getSigner: () => ethers.Signer; getContract: () => ethers.Contract } => {
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

    const getContract = ():ethers.Contract => {
        const signer = getSigner();
        const contract = new ethers.Contract(contract_address, INSTAabi, signer);
        return contract;
    }

    return {
        getSigner,
        getContract
    }
}