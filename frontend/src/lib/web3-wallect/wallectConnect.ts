// web3ModalConfig.ts
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/vue';
// import { ref } from 'vue';
// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '922f050d93e9689768bf36aac1212c06'

// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'SepoliaETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org'
}

// const buaanet = {
//   chainId: 20250107,
//   name: 'buaanet',
//   currency: 'bcoin',
//   rpcUrl: 'http://111.119.239.159:36054'
// }

// 3. Create your application's metadata object
const metadata = {
  name: 'storage market',
  description: 'a decentralized storage market on IPFS',
  url: 'http://localhost:5173/', // url must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: sepolia.rpcUrl, // using Sepolia RPC URL
  defaultChainId: 11155111 // Sepolia chain ID
})

// 5. Create a Web3Modal instance
const walletconnect_model = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeVariables: {
    '--w3m-font-family': 'IBM Plex Mono, monospace'
  }
})

export default walletconnect_model;
