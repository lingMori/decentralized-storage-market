// router/index.ts
import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw, RouterOptions } from "vue-router";

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

// 添加全局导航守卫
router.beforeEach((to, from, next) => {
    // 确保异步组件加载完成
    if (to.matched.some(record => !record.components)) {
        // 等待异步组件加载
        Promise.all(to.matched.map(record => {
            const Component = record.components?.default;
            if (Component && typeof Component === 'function') {
                return Component;
            }
            return Promise.resolve();
        })).then(() => {
            next();
        }).catch(error => {
            console.error('Route error:', error);
            next(false);
        });
    } else {
        next();
    }
});

export default router;
