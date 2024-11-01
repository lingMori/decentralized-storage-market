import { useInstaShareContract } from "./useContract";

export const accountRepo = (): {
    register: () => Promise<{ success: boolean; error?: string }>; 
    checkRegistrationStatus: (address: string) => Promise<{ isRegistered: boolean; response?: any }> 
} => {

    const { getContract } = useInstaShareContract();
    
    const register = async () => {
        try {
            const contract = getContract();
            const tx = await contract.registerInstanceOwner(); // 确保等待交易完成
            await tx.wait();
            return { success: true };
        } catch (error: any) {
            if (error.code === 4001) { // 直接检查 error.code
                return { success: false, error: '用户拒绝了交易' };
            }
            if (error.message.includes('AlreadyRegistered')) {
                return { success: false, error: '该地址已经注册' };
            }
            return { success: false, error: '注册失败，请稍后重试' };
        }
    };

    const checkRegistrationStatus = async (address: string) => {
        try {
            const contract = getContract();
            const response = await contract.getUserStats(address);
            // 如果能获取到用户状态，说明已注册
            return { isRegistered: true, response };
        } catch (error: any) {
            console.error("Error checking registration status:", error); // 记录错误信息
            return { isRegistered: false };
        }
    };

    return {
        register,
        checkRegistrationStatus
    };
};