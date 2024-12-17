// src/store/ipfsServerDB.ts
import { defineStore } from 'pinia'
import type { dangoConfig } from "@/lib/ipfs-client/dango-ipfs-ts/types/dango.type"

export interface IPFSNode {
  id: string
  name: string
  rpcConfig: dangoConfig
  gatewayConfig: dangoConfig
  location: string
  type: 'production' | 'staging' | 'development'
  status: 'active' | 'warning' | 'offline'
}

export const useIPFSStore = defineStore('ipfs', {
  state: () => ({
    currentNode: null as IPFSNode | null,
    availableNodes: [
      {
        id: '1',
        name: '节点1',
        rpcConfig: {
          protocol: 'http',
          host: '111.119.239.159',
          port: '12801'
        },
        gatewayConfig: {
          protocol: 'http',
          host: '111.119.239.159',
          port: '17801'
        },
        location: 'US East (N. Virginia)',
        type: 'production',
        status: 'active'
      },
      {
        id: '2',
        name: '节点2',
        rpcConfig: {
          protocol: 'http',
          host: '82.157.200.60',
          port: '17501'
        },
        gatewayConfig: {
          protocol: 'http',
          host: '82.157.200.60',
          port: '17801'
        },
        location: 'US West (Oregon)',
        type: 'staging',
        status: 'warning'
      }
    ] as IPFSNode[]
  }),
  actions: {
    switchNode(nodeId: string) {
      const selectedNode = this.availableNodes.find(node => node.id === nodeId)
      
      if (selectedNode) {
        this.currentNode = selectedNode
        
        // 触发节点切换事件
        window.dispatchEvent(new CustomEvent('ipfs-node-changed', { 
          detail: {
            rpcConfig: selectedNode.rpcConfig,
            gatewayConfig: selectedNode.gatewayConfig
          }
        }))
      }
    },
    
    // 获取当前节点状态
    getCurrentNodeStatus() {
      return this.currentNode?.status || 'offline'
    }
  },
  getters: {
    getCurrentNode(): IPFSNode | null {
      return this.currentNode
    }
  }
})
