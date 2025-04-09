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
      // nodes config
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

    async fetchAvaliableNodes(url: string) {
      // TODO : fetch ipfs nodes of users 
      // nodes can be fetch with { userAddress: string, signature: string, commitment: string }
      // ask server or contract with this message to get nodes
      try {
        const response = await fetch(url)
        if (!response.ok){
          throw new Error(`Http error! status: ${response.status}`)
        }

        const nodes = await response.json() as IPFSNode[]
        this.availableNodes = nodes

        // If current node is not in the new list, reset it
        if (this.currentNode && !nodes.find(node => node.id === this.currentNode?.id)) {
          this.currentNode = null
        }

        return nodes
      }catch(error) {
        throw new Error (`Filed to fetch nodes: ${error} !`)
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
