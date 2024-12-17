import type { App } from 'vue'
import type { dangoConfig } from "@/lib/ipfs-client/dango-ipfs-ts/types/dango.type"
import dangoIPFS from "@/lib/ipfs-client/dango-ipfs-ts/plugin/dangoIPFS"

export const IPFSPlugin = {
  install: async (app: App, initialConfigs: { rpcConfig: dangoConfig, gatewayConfig: dangoConfig }) => {
    // 初始化 IPFS
    await dangoIPFS.install(app, [
      { config: initialConfigs.rpcConfig, protocolName: 'dangoRPC' },
      { config: initialConfigs.gatewayConfig, protocolName: 'dangoGateway' }
    ])

    // 监听节点变更事件
    window.addEventListener('ipfs-node-changed', async (event: Event) => {
      const customEvent = event as CustomEvent
      const { rpcConfig, gatewayConfig } = customEvent.detail

      try {
        // 重新初始化 IPFS 插件
        await dangoIPFS.install(app, [
          { config: rpcConfig, protocolName: 'dangoRPC' },
          { config: gatewayConfig, protocolName: 'dangoGateway' }
        ])
      } catch (error) {
        console.error('Failed to reinitialize IPFS nodes:', error)
      }
    })
  }
}
