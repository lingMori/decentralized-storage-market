import "./assets/index.css"
import "./assets/base.css"
import './assets/style.scss'

import { createApp } from 'vue'
import App from './App.vue'
import routerModule from "./router"
import piniaModule from "./store"
import dangoIPFS from "./lib/ipfs-client/dango-ipfs-ts/plugin/dangoIPFS"
import type { dangoConfig } from "./lib/ipfs-client/dango-ipfs-ts/types/dango.type"

const dangoRPCConfig:dangoConfig = {
    protocol: 'http',
    host: '111.119.239.159',
    port: '12801',
}

const dangoGatewayConfig:dangoConfig = {
    protocol: 'http',
    host: '111.119.239.159',
    port: '17801',
}

const storageApp = createApp(App);
storageApp.use(routerModule);
storageApp.use(piniaModule);
storageApp.use(dangoIPFS, [
    { config: dangoRPCConfig, protocolName: 'dangoRPC' },
    { config: dangoGatewayConfig, protocolName: 'dangoGateway' }
]);

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // document.body.classList.add("dark-theme");
}

storageApp.mount('#app')
