import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
// import { LedgerConnector } from "@web3-react/ledger-connector";
// import { TrezorConnector } from "@web3-react/trezor-connector";
// import { FrameConnector } from "@web3-react/frame-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { PortisConnector } from "@web3-react/portis-connector";
// import { SquarelinkConnector } from "@web3-react/squarelink-connector";
// import { TorusConnector } from "@web3-react/torus-connector";
// import { AuthereumConnector } from "@web3-react/authereum-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: "https://mainnet.infura.io/v3/2b150eabf65140efb3d5508a888ee93e",
  250: "https://rpc.ftm.tools",
  1285: "https://rpc.moonriver.moonbeam.network",
  42161: "https://arb1.arbitrum.io/rpc",
  1666600000: "https://harmony-0-rpc.gateway.pokt.network/",
};

export const NETWORKS_CONFIG = [
  {
    chainId: "0xfa",
    chainName: "Fantom Mainnet",
    nativeCurrency: {
      "name": "Fantom",
      "symbol": "FTM",
      "decimals": 18
    },
    rpcUrls: ["https://rpc.ftm.tools"],
    blockExplorerUrls: ["https://ftmscan.com"]
  },
  {
    chainId: "0x505",
    chainName: "Moonriver",
    nativeCurrency: {
      "name": "Moonriver",
      "symbol": "MOVR",
      "decimals": 18
    },
    rpcUrls: ["https://rpc.moonriver.moonbeam.network"],
    blockExplorerUrls: ["https://moonriver.moonscan.io/"]
  },
  {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: {
      "name": "AETH",
      "symbol": "AETH",
      "decimals": 18
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  {
    chainId: "0x63564c40",
    chainName: "Harmony",
    nativeCurrency: {
      "name": "ONE",
      "symbol": "ONE",
      "decimals": 18
    },
    rpcUrls: ["https://api.harmony.one",
      "https://s1.api.harmony.one",
      "https://s2.api.harmony.one",
      "https://s3.api.harmony.one"],
    blockExplorerUrls: ["https://explorer.harmony.one/"],
  },
]

export const network = new NetworkConnector({ urls: { 1: RPC_URLS[1] } });

export const injected = new InjectedConnector({
  supportedChainIds: [1, 250, 42161, 1666600000]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: "veToken"
});

export const fortmatic = new FortmaticConnector({
  apiKey: "pk_live_F95FEECB1BE324B5",
  chainId: 1
});

export const portis = new PortisConnector({
  dAppId: "5dea304b-33ed-48bd-8f00-0076a2546b60",
  networks: [1, 100]
});
