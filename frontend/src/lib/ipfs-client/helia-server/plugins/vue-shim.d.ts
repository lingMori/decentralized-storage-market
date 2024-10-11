// vue-shim.d.ts
import { Helia } from "@helia/http";

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $heliaClient: Promise<Helia>;
  }
}
