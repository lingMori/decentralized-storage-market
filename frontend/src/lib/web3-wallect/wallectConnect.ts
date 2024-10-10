// web3ModalConfig.ts
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/vue';
import { ref } from 'vue';
// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

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
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
const walletconnect_model = createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeVariables: {
    '--w3m-font-family': 'IBM Plex Mono, monospace'
  }
})

export default walletconnect_model;
