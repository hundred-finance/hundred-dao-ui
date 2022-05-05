import { GET_LOCKS, GET_TOKEN_BALANCES, MIRROR_LOCKS, MIRRORS_UPDATED } from './constants';

import stores from './';
import { Contract, Provider } from 'ethcall';
import MerkleTreeMirrorsGenerator from './mirrors/merkleTreeMirrorsGenerator';
import Mirrors from './mirrors/mirrors.json';
import { MERKLE_MIRROR_ABI } from './abis/MerkleMirror';
import { ethers } from 'ethers';

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      mirrors: [],
    };

    const that = this;

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_LOCKS:
            that.getLocks(payload);
            break;
          case MIRROR_LOCKS:
            that.mirrorLocks(payload);
            break;
          default: {
          }
        }
      }.bind(this),
    );
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(MIRRORS_UPDATED, this.store.mirrors);
  }

  buildMerkleTree() {
    let tree = new MerkleTreeMirrorsGenerator(Mirrors);
    tree.process();

    return tree;
  }

  getProofs(user) {
    const MerkleTree = this.buildMerkleTree();

    let userLocks = Mirrors.filter((m) => m[0].toLowerCase() === user.toLowerCase());

    return userLocks.map((lock) => {
      return {
        lock: lock,
        proof: MerkleTree.generateProof(lock[0], lock.slice(1)),
      };
    });
  }

  async getLocks(payload) {
    const project = payload.project;

    if (!project?.merkleMirror) {
      return null;
    }

    const provider = await stores.accountStore.getEthersProvider();
    if (!provider) {
      return null;
    }

    const account = stores.accountStore.getStore('account');
    if (!account || !account.address) {
      return null;
    }

    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    if (project.multicallAddress) {
      ethcallProvider.multicall = { address: project.multicallAddress, block: 0 };
    }

    const mirrors = this.getProofs(account.address);

    const merkleContract = new Contract(project.merkleMirror, MERKLE_MIRROR_ABI);

    const calls = mirrors.map((m) => merkleContract.hasMirrored(0, account.address, m.lock[1], 0));

    const data = await ethcallProvider.all(calls);

    for (let i = 0; i < mirrors.length; i++) {
      mirrors[i].isMirrored = data[i];
    }

    this.setStore({ mirrors: await this.locksToMirror(mirrors) });
  }

  async mirrorLocks(payload) {
    const project = payload.project;

    const account = stores.accountStore.getStore('account');
    if (!account || !account.address) {
      return null;
    }

    let locks = await this.locksToMirror(this.store.mirrors);

    const prov = new ethers.providers.Web3Provider(window.ethereum);
    const mirrorContract = new Contract(project.merkleMirror, MERKLE_MIRROR_ABI, prov.getSigner());

    let tx = await mirrorContract.multicall(this.buildMirrorTransactions(locks, mirrorContract));
    await tx.wait().then((_) => {
      this.dispatcher.dispatch({ type: GET_LOCKS, project: project });
      this.dispatcher.dispatch({ type: GET_TOKEN_BALANCES, content: { id: project.id } });
    });
  }

  async locksToMirror(mirrors) {
    const provider = await stores.accountStore.getEthersProvider();
    let { chainId } = await provider?.getNetwork();
    return mirrors.filter((m) => parseInt(m.lock[1]) !== chainId && !m.isMirrored);
  }

  buildMirrorTransactions(mirrors, contract) {
    return mirrors.map((m) => {
      return {
        target: contract.address,
        data: contract.interface.encodeFunctionData('mirror_lock', [m.lock[0], m.lock[1], m.lock[2], m.lock[3], m.lock[4], 0, m.proof]),
      };
    });
  }
}

export default Store;
