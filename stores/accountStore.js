import async from 'async';
import { ethers } from 'ethers';
import Web3 from 'web3';
import {
  ERROR, STORE_UPDATED, CONFIGURE, CONFIGURE_RETURNED, ACCOUNT_CHANGED, CONFIGURE_GAUGES,
} from './constants';

import {
  injected, walletconnect, walletlink, fortmatic, network,
} from './connectors';

import stores from './index';

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      account: null,
      web3context: null,
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Fortmatic: fortmatic,
      },
    };

    const that = this;

    dispatcher.register((payload) => {
      switch (payload.type) {
        case CONFIGURE:
          that.configure(payload);
          break;
        default: {
        }
      }
    });
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    console.log(this.store);
    return this.emitter.emit(STORE_UPDATED);
  }

  async configure() {
    await injected
      .isAuthorized()
      .then(async (isAuthorized) => {
        if (isAuthorized) {
          await injected
            .activate()
            .then(async (a) => {
              this.setStore({
                account: { address: a.account },
                web3context: { library: { provider: a.provider } },
              });
              this.emitter.emit(CONFIGURE_RETURNED);
            })
            .catch((e) => {
              this.emitter.emit(ERROR, e);
              this.emitter.emit(CONFIGURE_RETURNED);
            });
        } else {
          // we can ignore if not authorized.
          this.emitter.emit(CONFIGURE_RETURNED);
        }
      })
      .catch((e) => {
        this.emitter.emit(ERROR, e);
        this.emitter.emit(CONFIGURE_RETURNED);
      });

    if (window.ethereum) {
      await this.updateAccount();
    } else {
      window.removeEventListener('ethereum#initialized', this.updateAccount);
      window.addEventListener('ethereum#initialized', this.updateAccount, {
        once: true,
      });
    }
  }

  async updateAccount() {
    const that = this;

    window.ethereum.on('accountsChanged', async (accounts) => {
      const provider = await stores.accountStore.getWeb3Provider();
      const connectedChainId = await provider.eth.getChainId();

      that.setStore({
        account: { address: accounts[0], chainId: connectedChainId },
        web3context: { library: { provider: window.ethereum } },
      });

      that.emitter.emit(ACCOUNT_CHANGED);
      that.emitter.emit(CONFIGURE_RETURNED);

      that.dispatcher.dispatch({ type: CONFIGURE_GAUGES });
    });

    window.ethereum.on('chainChanged', (networkId) => {
      history.replaceState({}, '', '/');
      location.reload();
    });

    that.setStore({
      account: { address: that.store.account.address, chainId: parseInt(window.ethereum.chainId) },
    });
  }

  async getWeb3Provider() {
    try {
      const web3context = this.getStore('web3context');
      let provider = null;

      if (web3context && web3context.library) {
        provider = web3context.library.provider;
      } else {
        provider = network.providers['1'];
      }

      if (!provider) {
        return null;
      }
      return new Web3(provider);
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  async getEthersProvider() {
    try {
      const web3context = this.getStore('web3context');
      let provider = null;

      if (web3context && web3context.library) {
        provider = web3context.library.provider;
      } else {
        provider = network.providers['1'];
      }

      if (!provider) {
        return null;
      }
      return new ethers.providers.Web3Provider(provider);
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }
}

export default Store;
