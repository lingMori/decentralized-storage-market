import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw, RouterOptions } from "vue-router";
import { useInstaShareContract } from "@/lib/contract-interact/useContract";
import { accountRepo } from "@/lib/contract-interact/accountRepp";
import { useWeb3ModalAccount } from "@web3modal/ethers5/vue";

const routes: RouteRecordRaw[] = [
    {
        path: '/dashboard',
        name: 'DashBoard',
        component: () => import("@/pages/dashboard/index.vue"),
        redirect: '/dashboard/upload', // 添加重定向
        children: [
            {
                path: 'upload',
                name: 'Upload',
                component: () => import("@/pages/dashboard/Upload.vue")
            },
            {
                path: 'filebox',
                name: 'Filebox',
                component: () => import("@/pages/dashboard/Filebox.vue")
            },
            {
                path: 'public',
                name: 'Public',
                component: () => import("@/pages/dashboard/Public.vue")
            },
            {
                path: 'result/:value',
                name: 'Result',
                component: () => import("@/pages/dashboard/Result.vue")
            }
        ]
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import("@/pages/dashboard/Register.vue")
    },
    {
        path: '/',
        name: 'Home',
        redirect: '/dashboard/upload'
    },
    {
        path: '/test',
        name: 'Test',
        component: () => import("@/pages/dashboard/Test.vue")
    },
    // 添加通配符路由
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const options: RouterOptions = {
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 处理滚动行为
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
};

const router = createRouter(options);
const { getSigner } = useInstaShareContract();
const { checkRegistrationStatus } = accountRepo();
const { isConnected } = useWeb3ModalAccount();

const checkLogin = (): boolean => {
    try {
      const status: boolean = isConnected.value ? true : false;
      return status
  
    } catch (error) {
      console.log('register configration error: ', error)
    }
    return false
  }

const checkRegister = async (): Promise<boolean> => {
    try {
        const address = await getSigner().getAddress();
        const { isRegistered } = await checkRegistrationStatus(address);
        console.log("has registered: ", isRegistered);
        return isRegistered;
    } catch (error) {
        console.log('register configuration error: ', error);
    }
    return false; // Ensure a boolean is always returned
};

// 添加全局导航守卫
router.beforeEach(async (to, from, next) => {
    // const isRegistered: boolean = await checkRegister();
    // const isLogin: boolean = checkLogin();

    // if (!isLogin && to.path !== '/register') {
    //     next('/register'); // Redirect to register if not logged in
    // }
    // // Check if user is registered before navigating
    // if (!isRegistered && to.path !== '/register') {
    //     next('/register'); // Redirect to register if not registered
    // } else {
    //     next(); // Allow navigation
    // }
    next()
});

export default router;
