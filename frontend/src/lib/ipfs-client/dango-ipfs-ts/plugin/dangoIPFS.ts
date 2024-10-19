import createDangoClient from "../core/dangoClient";
import type{ App } from "vue";
import type { dangoConfig } from "../types/dango.type";
import createDangoGatewayClient from "../core/dangoGateway";


export default {
    install: async (app: App, options: Array<{ config: dangoConfig, protocolName: string }>) => {
      try {
        for (const option of options) {
          const isGateway = option.protocolName === 'dangoGateway';
          const client = isGateway
            ? await createDangoGatewayClient(option.config)
            : await createDangoClient(option.config);
  
          if (!client) {
            throw new Error(`Failed to create the client for ${option.protocolName}`);
          }

          console.log('Client created for', option.protocolName);
          app.provide(option.protocolName, client);
        }
      } catch (error) {
        console.error('Error during installation:', error);
      }
    }
  }
  