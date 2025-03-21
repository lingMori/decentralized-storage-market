import "./assets/index.css"
import "./assets/base.css"
import './assets/style.scss'
import 'vue-files-preview/lib/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import routerModule from "./router"
import piniaModule from "./store"
import { useIPFSStore } from "./store/ipfsServerDB"
import { IPFSPlugin } from "./lib/ipfs-client/dango-ipfs-ts/plugin/IpfsPlugin"
import VueFilesPreview from 'vue-files-preview'
import type { dangoConfig } from "./lib/ipfs-client/dango-ipfs-ts/types/dango.type"

const storageApp = createApp(App);
storageApp.use(routerModule);
storageApp.use(piniaModule);
storageApp.use(VueFilesPreview)

const ipfsStore = useIPFSStore();
ipfsStore.switchNode('1')
const initialRPCConfig = ipfsStore.currentNode?.rpcConfig as dangoConfig;
const initialGatewayConfig = ipfsStore.currentNode?.gatewayConfig as dangoConfig;

storageApp.use(IPFSPlugin, {
    rpcConfig: initialRPCConfig,
    gatewayConfig: initialGatewayConfig
})

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // document.body.classList.add("dark-theme");
}

storageApp.mount('#app')
