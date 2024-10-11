import { createRouter, createWebHashHistory } from "vue-router";
import type { Router, RouteRecordRaw, RouterOptions } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path:'/dashboard',
        name:'DashBoard',
        component:() => import("@/pages/dashboard/index.vue"),
        children: [
            {
                path: 'upload',
                name: 'Upload',
                component:() => import("@/pages/dashboard/Upload.vue")
            },
            {
                path: 'box',
                name: 'Box',
                component: () => import("@/pages/dashboard/Box.vue")
            }
        ]
    },
    {
        path: '/',
        name: 'Home',
        // redirect: '/dashboard/upload'
        component: () => import("@/pages/Home.vue")
    }
]

const options: RouterOptions = {
    history: createWebHashHistory(),
    routes
}

const routerModule: Router = createRouter(options);

export default routerModule