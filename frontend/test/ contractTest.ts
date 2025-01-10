import { ethers } from "ethers";
import StorageMarketABI from '../../contract/data-market/abi/StorageMarket.json'

interface StorageProvider {
    sellID: number;
    providerAddress: string;
    availableSpace: number;
    pricePerMBPerMonth: number;
    stakedETH: number;
    isValid: boolean;
}

interface DataOrder {
    orderID: number;
    providerAddress: string;
    buyerAddress: string;
    storageSpace: number;
    totalCost: number;
    stakedETH: number;
    verificationContract: string;
}

export class DataMarketplaceTest {
    private contract: ethers.Contract;
    private signer: ethers.Signer;

    constructor(
        private contractAddress: string,
        private provider: ethers.providers.Web3Provider
    ) {
        this.signer = provider.getSigner();
        this.contract = new ethers.Contract(
            contractAddress,
            StorageMarketABI,
            this.signer
        );
    }

    static async initialize(ethereum: any): Promise<DataMarketplaceTest> {
        if (!ethereum) {
            throw new Error("MetaMask is not installed!");
        }
        
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []); // Request account access
        
        const contractAddress = '0xe76DE1e72C90C92DbCcf2A2ab2De0a244C987f8a';
        return new DataMarketplaceTest(contractAddress, provider);
    }

    async registerStorageProvider(
        availableSpace: number,
        pricePerMBPerMonth: number,
        allowedDeviationPercentage: number
    ): Promise<ethers.ContractTransaction> {
        const requiredStake = availableSpace * pricePerMBPerMonth;

        try {
            const tx = await this.contract.registerStorageProvider(
                availableSpace,
                pricePerMBPerMonth,
                allowedDeviationPercentage,
                { value: requiredStake }
            );
            const receipt = await tx.wait();
            console.log('Storage Provider registered:', receipt);
            return tx;
        } catch (error) {
            console.error('Error registering storage provider:', error);
            throw error;
        }
    }

    async createDataOrder(sellID: number): Promise<ethers.ContractTransaction> {
        try {
            // First get the provider info to calculate the required payment
            const provider = await this.contract.getProviderInfo(sellID);
            const totalCost = provider.pricePerMBPerMonth * provider.availableSpace;

            const tx = await this.contract.createDataOrder(sellID, {
                value: totalCost // Sending exact amount, assuming no deviation
            });
            const receipt = await tx.wait();
            console.log('Data Order created:', receipt);
            return tx;
        } catch (error) {
            console.error('Error creating data order:', error);
            throw error;
        }
    }

    async getValidProviders(): Promise<StorageProvider[]> {
        try {
            const validIDs = await this.contract.getValidProviderSellIDs();
            const providers: StorageProvider[] = [];
            
            for (const id of validIDs) {
                const provider = await this.contract.getProviderInfo(id);
                providers.push({
                    sellID: provider.sellID.toNumber(),
                    providerAddress: provider.providerAddress,
                    availableSpace: provider.availableSpace.toNumber(),
                    pricePerMBPerMonth: provider.pricePerMBPerMonth.toNumber(),
                    stakedETH: provider.stakedETH.toNumber(),
                    isValid: provider.isValid
                });
            }
            
            return providers;
        } catch (error) {
            console.error('Error getting valid providers:', error);
            throw error;
        }
    }

    async getOrderInfo(orderID: number): Promise<DataOrder> {
        try {
            const order = await this.contract.getOrderInfo(orderID);
            return {
                orderID: order.orderID.toNumber(),
                providerAddress: order.providerAddress,
                buyerAddress: order.buyerAddress,
                storageSpace: order.storageSpace.toNumber(),
                totalCost: order.totalCost.toNumber(),
                stakedETH: order.stakedETH.toNumber(),
                verificationContract: order.verificationContract
            };
        } catch (error) {
            console.error('Error getting order info:', error);
            throw error;
        }
    }
}

// Example usage
export const testContract = async () => {
    try {
        const marketplace = await DataMarketplaceTest.initialize(window.ethereum);
        
        // Test registering a storage provider
        await marketplace.registerStorageProvider(
            999, // Available space in MB
            10000, // Price per MB per month in wei
            10 // Allowed deviation percentage
        );
        
        // Get all valid providers
        const providers = await marketplace.getValidProviders();
        console.log('Valid providers:', providers);
        
        // Create a data order for the first valid provider if any exist
        // if (providers.length > 0) {
        //     await marketplace.createDataOrder(providers[0].sellID);
        // }
        
    } catch (error) {
        console.error('Contract test failed:', error);
    }
};
