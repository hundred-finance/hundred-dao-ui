import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const POLLING_INTERVAL = 12000;

export const NETWORKS_CONFIG = [
  {
    chainId: '0xfa',
    chainName: 'Fantom Mainnet',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ftm.tools'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  {
    chainId: '0x505',
    chainName: 'Moonriver',
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
    blockExplorerUrls: ['https://moonriver.moonscan.io'],
  },
  {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'AETH',
      symbol: 'AETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  {
    chainId: '0x63564c40',
    chainName: 'Harmony',
    nativeCurrency: {
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrls: ['https://api.harmony.one', 'https://s1.api.harmony.one', 'https://s2.api.harmony.one', 'https://s3.api.harmony.one'],
    blockExplorerUrls: ['https://explorer.harmony.one'],
  },
  {
    chainId: '0x2A',
    chainName: 'kovan',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://kovan.etherscan.io'],
  },
  {
    chainId: '0x64',
    chainName: 'Gnosis Chain',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.xdaichain.com/'],
    blockExplorerUrls: ['https://blockscout.com/xdai/mainnet/'],
  },
  {
    chainId: '0xa',
    chainName: 'Optimism Chain',
    nativeCurrency: {
      name: 'OETH',
      symbol: 'OETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc-mainnet.matic.network',
      'https://rpc-mainnet.maticvigil.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://matic-mainnet.chainstacklabs.com',
      'https://matic-mainnet-full-rpc.bwarelabs.com',
      'https://matic-mainnet-archive-rpc.bwarelabs.com',
    ],
    blockExplorerUrls: ['https://explorer.matic.network', 'https://explorer-mainnet.maticvigil.com/'],
  },
  {
    chainId: '0x1251',
    chainName: 'Iotex',
    nativeCurrency: {
      name: 'IOTX',
      symbol: 'IOTX',
      decimals: 18,
    },
    rpcUrls: ['https://babel-api.mainnet.iotex.io'],
    blockExplorerUrls: ['https://iotexscout.io/'],
  },
];

const supportedChains = NETWORKS_CONFIG.map((n) => parseInt(n.chainId));

const RPC_URLS = {};
NETWORKS_CONFIG.forEach((n) => {
  RPC_URLS[parseInt(n.chainId)] = n.rpcUrls[0];
});

export const injected = new InjectedConnector({
  supportedChainIds: supportedChains,
});

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'Hundred Finance Governance',
  supportedChainIds: supportedChains,
});
