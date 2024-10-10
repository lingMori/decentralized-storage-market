import "./assets/index.css"
import './assets/style.scss'

import { createApp } from 'vue'
import App from './App.vue'
import routerModule from "./router"
import piniaModule from "./store"

const storageApp = createApp(App);
storageApp.use(routerModule);
storageApp.use(piniaModule);

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark-theme");
}

storageApp.mount('#app')
