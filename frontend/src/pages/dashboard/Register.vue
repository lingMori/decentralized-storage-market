<template>
    <SwitchServerLoading :show="loading" />
    <div v-if="!loading">
        <RegisterDialogV2
            :is-logged-in="hasRegister"
            @update:is-logged-in="updateRegisterStatus"
            v-if="showDialog"
        />
    </div>
</template>

<script setup lang="ts">
import SwitchServerLoading from '@/components/storageUI/Loading/SwitchServerLoading.vue';
import RegisterDialogV2 from '@/components/storageUI/Dialog/RegisterDialogV2.vue';
import { onMounted, ref, watch } from 'vue';
import { useWeb3ModalAccount } from '@web3modal/ethers5/vue';
import { SUBGRAPH_API } from '@/configs/SUBGRAPH_API';
import { createGraphqlClient } from '@/lib/contract-interact/graphSQL/client/graphqlClient';
import { findUserbyAddr } from '@/lib/contract-interact/graphSQL/temp/findUserbyAddr';
import type { User } from "@/lib/contract-interact/graphSQL/types/types";
import router from "@/router";

const hasRegister = ref(false);
const hasLogin = ref(false);
const loading = ref(false);
const showDialog = ref(true);
const { isConnected, address } = useWeb3ModalAccount();

const updateRegisterStatus = (value: boolean) => {
    hasRegister.value = value;
    if (value) {
        showDialog.value = false;
        router.push("/dashboard/upload");
    }
};

const checkRegister = async (): Promise<boolean> => {
    if (!address.value) return false;
    
    const graphSQL = findUserbyAddr(address.value);
    loading.value = true;
    
    try {
        const sql_client = createGraphqlClient(SUBGRAPH_API, graphSQL);
        const response = await sql_client as { user: User | null };
        
        return !!(response && response.user);
    } catch (error) {
        console.error("Check register error:", error);
        return false;
    } finally {
        loading.value = false;
    }
};

const checkLogin = (): boolean => {
    return isConnected.value;
};

watch(isConnected, async (newValue) => {
    if (newValue) {
        hasLogin.value = true;
        loading.value = true;
        hasRegister.value = await checkRegister();
        loading.value = false;
        if (hasRegister.value) {
            showDialog.value = false;
            router.push("/dashboard/upload");
        }
    } else {
        hasLogin.value = false;
        hasRegister.value = false;
    }
});

// watch(hasRegister, async (newValue) => {
//     if (newValue) {
//         showDialog.value = false;
//         await router.push("/dashboard/upload");
//     }
// });


onMounted(async () => {
    loading.value = true;
    hasLogin.value = checkLogin();
    loading.value = false;
    
    if (hasLogin.value) {
        loading.value = true;
        hasRegister.value = await checkRegister();
        loading.value = false;
        
        if (hasRegister.value) {
            showDialog.value = false;
            await router.push("/dashboard/upload");
        }
    }
});
</script>

<style scoped lang="scss">
</style>
