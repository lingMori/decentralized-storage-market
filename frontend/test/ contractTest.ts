import { ethers } from "ethers"
import StorageMarketABI from '../../contract/data-market/abi/StorageMarket.json'

interface RegisterMessage {
  availableSpace: number,
  pricePerMBPerMonth: number,
  allowedDeviationPercentage: number,
}

interface DataOrder {
  orderID: string,
  providerAddress: string,
  buyerAddress: string,
  storageSpace: string,
  totalCost: string,
  stakedETH: string,
  verificationContract: string
}

export const contractTest = async() => {

  const contractABI = StorageMarketABI;
  const contractAddress = '0x008c408207fdC51f24027C585837B5d67444a61b'
  if (window.ethereum){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // const dataOrders: DataOrder[] = await contract
  } else {
    console.log("Please install MetaMask!");
  }
  
  
}
