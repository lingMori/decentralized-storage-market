import "./assets/index.css"
import "./assets/base.css"
import './assets/style.scss'
import 'vue-files-preview/lib/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import routerModule from "./router"
import piniaModule from "./store"
// import dangoIPFS from "./lib/ipfs-client/dango-ipfs-ts/plugin/dangoIPFS"
// import type { dangoConfig } from "./lib/ipfs-client/dango-ipfs-ts/types/dango.type"
import { useIPFSStore } from "./store/ipfsServerDB"
import { IPFSPlugin } from "./lib/ipfs-client/dango-ipfs-ts/plugin/IpfsPlugin"
import VueFilesPreview from 'vue-files-preview'

// const dangoRPCConfig:dangoConfig = {
//     protocol: 'http',
//     host: '111.119.239.159',
//     // host: '82.157.200.60',
//     port: '12801',
//     // port: '17501',
// }

// const dangoGatewayConfig:dangoConfig = {
//     protocol: 'http',
//     host: '111.119.239.159',
//     // host: '82.157.200.60',
//     port: '17801',
//     // port: '17801',
// }

const storageApp = createApp(App);
storageApp.use(routerModule);
storageApp.use(piniaModule);
storageApp.use(VueFilesPreview)

const ipfsStore = useIPFSStore();
const initialRPCConfig = ipfsStore.availableNodes[0].rpcConfig;
const initialGatewayConfig = ipfsStore.availableNodes[0].gatewayConfig;
storageApp.use(IPFSPlugin, {
    rpcConfig: initialRPCConfig,
    gatewayConfig: initialGatewayConfig
})
// storageApp.use(dangoIPFS, [
//     { config: dangoRPCConfig, protocolName: 'dangoRPC' },
//     { config: dangoGatewayConfig, protocolName: 'dangoGateway' }
// ]);

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // document.body.classList.add("dark-theme");
}

storageApp.mount('#app')
