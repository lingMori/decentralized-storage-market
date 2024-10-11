import "./assets/index.css"
import './assets/style.scss'

import { createApp } from 'vue'
import App from './App.vue'
import routerModule from "./router"
import piniaModule from "./store"
import heliaClientPlugin from "./lib/ipfs-client/helia-server/plugins/heliaClientPlugin"
import type { HeliaServerConfig } from "./lib/ipfs-client/helia-server/core/helia-server.type"

const heliaConfig: HeliaServerConfig = {
    host: 'api.filebase.io/v1',
    // port: "v1",
    protocol: 'https',
}

const storageApp = createApp(App);
storageApp.use(routerModule);
storageApp.use(piniaModule);
storageApp.use(heliaClientPlugin, heliaConfig);

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark-theme");
}

storageApp.mount('#app')
