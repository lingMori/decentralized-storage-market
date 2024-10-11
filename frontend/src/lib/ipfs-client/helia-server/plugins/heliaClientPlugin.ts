import type { App } from "vue";
import createHeliaHTTPClient from "../core/heliaClient";
import type { HeliaServerConfig } from "../core/helia-server.type";
import type { Helia } from "@helia/http";

const heliaClientPlugin = {
    install: (app: App, heliaConfig: HeliaServerConfig) => {
        app.provide('heliaClient', createHeliaHTTPClient(heliaConfig));
        app.config.globalProperties.$heliaClient = createHeliaHTTPClient(heliaConfig);
    }
}

export default heliaClientPlugin;