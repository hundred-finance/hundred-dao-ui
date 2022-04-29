import async from 'async';
import {
  MAX_UINT256,
  ERROR,
  TX_SUBMITTED,
  STORE_UPDATED,
  CONFIGURE_GAUGES,
  GAUGES_CONFIGURED,
  GET_PROJECTS,
  PROJECTS_RETURNED,
  GET_PROJECT,
  PROJECT_RETURNED,
  GET_TOKEN_BALANCES,
  TOKEN_BALANCES_RETURNED,
  LOCK,
  LOCK_RETURNED,
  APPROVE_LOCK,
  APPROVE_LOCK_RETURNED,
  VOTE,
  VOTE_RETURNED,
  INCREASE_LOCK_AMOUNT,
  INCREASE_LOCK_AMOUNT_RETURNED,
  INCREASE_LOCK_DURATION,
  INCREASE_LOCK_DURATION_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  APPLY_BOOST,
  APPLY_BOOST_RETURNED,
  GET_LOCKS,
  MIRROR_LOCK,
} from './constants';

import {
  ERC20_ABI,
  GAUGE_CONTROLLER_ABI,
  GAUGE_ABI,
  VOTING_ESCROW_ABI,
  GAUGE_CONTROLLER_V2_ABI,
  BAAM_ABI,
  LAYER_ZERO_ENDPOINT_ABI,
  MIRRORED_VOTING_ESCROW_ABI,
  LAYER_ZERO_MIRROR_GATE_ABI,
  MULTICHAIN_MIRROR_GATE_ABI,
  MULTICHAIN_MIRROR_GATE_V2_ABI,
} from './abis';

import stores from './';
import BigNumber from 'bignumber.js';
import { PRICE_ORACLE_ABI } from './abis/HundredFinancePriceOracleABI';
import { CTOKEN_ABI } from './abis/CtokenABI';
import { REWARD_POLICY_MAKER_ABI } from './abis/RewardPolicyMaker';
import { network, NETWORKS_CONFIG } from './connectors';
import { Contract, Provider } from 'ethcall';
import { ethers } from 'ethers';
import { CETHER_ABI } from './abis/CetherABI';
import moment from 'moment';

const fetch = require('node-fetch');

const WEEK = 604800;
const DAY = 86400;

const currentEpochTime = () => Math.floor(new Date().getTime() / 1000);
const nextEpochTime = () => Math.floor(currentEpochTime() / WEEK) * WEEK + WEEK + DAY;

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      configured: false,
      projects: [
        {
          type: 'hundredfinance',
          id: 'hundred-finance-arbitrum',
          name: 'Arbitrum',
          logo: '/arbitrum.png',
          url: '',
          chainId: 42161,
          gaugeProxyAddress: '0xBA427dDccba3B63497D8148276Bf64783FaBBe7E',
          votingEscrow: '0xBa57440fA35Fdb671E58F6F56c1A4447aB1f6C2B',
          mirroredVotingEscrow: '0x6b5f15E939C8d797E6bd8D5fFda24eDeC655D08d',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          rewardPolicyMaker: '0xb5D66fB34DD0D874709fDB4682C89bB634E7c364',
          layerZero: {
            mirrorGate: '0x3752F823A8E5BfE706203C87Fb5BbbD33b943F02',
            endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
            endpointId: 10,
          },
          // multichain: {
          //   mirrorGate: '0x340A3F5a18c455f39714B6b692905801f21ed353',
          //   mirrorGateV2: '0xb13B67E805A621F58095277cBD98475Da451E739',
          //   endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          // },
          isBaamGauges: false,
          isV1Escrow: true,
          isV1Controller: true,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-fantom',
          name: 'Fantom',
          logo: '/fantom.png',
          url: '',
          chainId: 250,
          gaugeProxyAddress: '0x89Aa51685a2B658be8a7b9C3Af70D66557544181',
          votingEscrow: '0x376020c5B0ba3Fd603d7722381fAA06DA8078d8a',
          mirroredVotingEscrow: '0x6c63287CC629417E96b77DD7184748Bb6536A4e2',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          lpPriceOracles: [{ lp: '0xa33138a5a6a32d12b2ac7fc261378d6c6ab2ef90', oracle: '0xB9960251609e5b545416E87Abb375303B1162C3E' }],
          rewardPolicyMaker: '0x1B65EDec9370a29adb618f741C22fdbe20EB68DD',
          layerZero: {
            mirrorGate: '0xD7a8De0672131668be0366cF517DbD1c369cE200',
            endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
            endpointId: 12,
          },
          multichain: {
            mirrorGate: '0xc9F08308fE6724BD7F0E87e2661DE2FDfcC9e8a8',
            mirrorGateV2: '0xb13B67E805A621F58095277cBD98475Da451E739',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: false,
          isV1Escrow: true,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-fantom-lendly',
          name: 'Fantom (Lendly)',
          logo: '/fantom.png',
          url: '',
          chainId: 250,
          gaugeProxyAddress: '0x198618d2aa6cBC89Ea24550fE896D4afa28CD635',
          mirroredVotingEscrow: '0x6c63287CC629417E96b77DD7184748Bb6536A4e2',
          votingEscrow: '0x376020c5B0ba3Fd603d7722381fAA06DA8078d8a',
          lpPriceOracles: [
            { lp: '0x2084dCB19D498b8Eb4f1021B14A34308c077cf94', oracle: '0x4dCd0BF94E3b02fda9E3ca6d023E777392Cd5C63' },
            { lp: '0xA33138a5A6A32d12b2Ac7Fc261378d6C6AB2eF90', oracle: '0xB9960251609e5b545416E87Abb375303B1162C3E' },
          ],
          rewardPolicyMaker: '0x9A9C7C065efcd4A8FfBF3d97882BbcaEd4eB2910',
          layerZero: {
            mirrorGate: '0xD7a8De0672131668be0366cF517DbD1c369cE200',
            endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
            endpointId: 12,
          },
          multichain: {
            mirrorGate: '0xc9F08308fE6724BD7F0E87e2661DE2FDfcC9e8a8',
            mirrorGateV2: '0xb13B67E805A621F58095277cBD98475Da451E739',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: false,
          isV1Escrow: true,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-harmony',
          name: 'Harmony One',
          logo: '/harmony.png',
          url: '',
          chainId: 1666600000,
          gaugeProxyAddress: '0x61F95b38f880a6C5A4b7DD15560D7bB8B3E36f35',
          votingEscrow: '0xE4e43864ea18d5E5211352a4B810383460aB7fcC',
          mirroredVotingEscrow: '0x1dB11Cf7C332E797ac912e11b8762e0A4b24a836',
          lpPriceOracle: '0x10010069de6bd5408a6ded075cf6ae2498073c73',
          rewardPolicyMaker: '0xC3bae38Bfa2CbBE30f442649070408f484bd5882',
          multichain: {
            mirrorGate: '0xC457D2DD3209b7186934426ACd8391d504dc3978',
            endpoint: '0x6f058086d91a181007c2325e5b285425ca84d615',
          },
          isBaamGauges: false,
          isV1Escrow: true,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-moonriver',
          name: 'Moonriver',
          logo: '/moonriver.png',
          url: '',
          chainId: 1285,
          gaugeProxyAddress: '0xca78ca5C3Da9a5a4C960C1757456E99d9F1bc76d',
          mirroredVotingEscrow: '0x7A143fe393C8EC031e8A27129aB523FFC2c3125D',
          votingEscrow: '0x243E33aa7f6787154a8E59d3C27a66db3F8818ee',
          rewardPolicyMaker: '0x371F3AD36072230424C828629d53B0Dbd93c8273',
          lpPriceOracle: '0x10010069de6bd5408a6ded075cf6ae2498073c73',
          multichain: {
            mirrorGate: '0xc9F08308fE6724BD7F0E87e2661DE2FDfcC9e8a8',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: false,
          isV1Escrow: true,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
          multicallAddress: '0x9fdd7e3e2df5998c7866cd2471d7d30e04496dfa',
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-gnosis',
          name: 'Gnosis',
          logo: '/gnosis.png',
          url: '',
          chainId: 100,
          gaugeProxyAddress: '0x2105dE165eD364919703186905B9BB5B8015F13c',
          mirroredVotingEscrow: '0x988174f4AB5ad41E1313F1b07877dFe4A78CE5F2',
          votingEscrow: '0xf64E1a3eF0d2F5659dC4c10983e595B797C6ecA4',
          rewardPolicyMaker: '0x89Aa51685a2B658be8a7b9C3Af70D66557544181',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          nativeTokenGauge: '0x7BFE7b45c8019DEDc66c695Ac70b8fc2c0421584',
          multichain: {
            mirrorGate: '0xb1A76e5454E4aF0C4F8f7b071df14a3B4011e8AF',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          nativeTokenSymbol: 'xDAI',
          isBaamGauges: false,
          isV1Escrow: false,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-optimism',
          name: 'Optimism',
          logo: '/optimism.png',
          url: '',
          chainId: 10,
          gaugeProxyAddress: '0xBa57440fA35Fdb671E58F6F56c1A4447aB1f6C2B',
          mirroredVotingEscrow: '0xAc8204a9d79CA87D192ea98A9381600642A66a5F',
          votingEscrow: '0x1F8e8472e124F58b7F0D2598EaE3F4f482780b09',
          rewardPolicyMaker: '0x3ffd03Ef31F6D5A6C517CEFA9CDf43efEBeE8399',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          layerZero: {
            mirrorGate: '0x1cF3993EbA538e5f085333c86356622161Dd8C0B',
            endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
            endpointId: 11,
          },
          multichain: {
            mirrorGate: '0x27a1B793b5B51a8862F66B0a1181EF42b2A8D9C2',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: false,
          isV1Escrow: false,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-polygon',
          name: 'Polygon',
          logo: '/polygon.png',
          url: '',
          chainId: 137,
          gaugeProxyAddress: '0xF191d17dEe9943F06bB784C0492805280AeE0bf9',
          mirroredVotingEscrow: '0xc3CC9369fcB8491DaD4FA64cE1Fbd3DD2d70034f',
          votingEscrow: '0xb4BAfc3d60662De362c0cB0f5e2DE76603Ea77D7',
          rewardPolicyMaker: '0x1dB11Cf7C332E797ac912e11b8762e0A4b24a836',
          lpPriceOracle: '0x0b510A226F4A7A66c480988704eCd5306B6f1954',
          layerZero: {
            mirrorGate: '0x96a0eEa3a9cff74764b73A891c3b36a4F6B81181',
            endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
            endpointId: 9,
          },
          multichain: {
            mirrorGate: '0x9c15a48A2ce440298815f64ddd5De91800Ad89ec',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: false,
          isV1Escrow: false,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-polygon-bprotocol',
          name: 'Polygon (B.Protocol)',
          logo: '/polygon.png',
          url: '',
          chainId: 137,
          gaugeProxyAddress: '0x1cF3993EbA538e5f085333c86356622161Dd8C0B',
          mirroredVotingEscrow: '0xc3CC9369fcB8491DaD4FA64cE1Fbd3DD2d70034f',
          votingEscrow: '0xb4BAfc3d60662De362c0cB0f5e2DE76603Ea77D7',
          rewardPolicyMaker: '0x3A7f310ee75b8cE3e46410Ac438419842B541D10',
          lpPriceOracle: '0x0b510A226F4A7A66c480988704eCd5306B6f1954',
          layerZero: {
            mirrorGate: '0x96a0eEa3a9cff74764b73A891c3b36a4F6B81181',
            endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
            endpointId: 9,
          },
          multichain: {
            mirrorGate: '0x9c15a48A2ce440298815f64ddd5De91800Ad89ec',
            endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          },
          isBaamGauges: true,
          isV1Escrow: false,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        {
          type: 'hundredfinance',
          id: 'hundred-finance-iotex',
          name: 'Iotex',
          logo: '/iotex.png',
          url: '',
          chainId: 4689,
          gaugeProxyAddress: '0x4adF575DBe0e6F1c5909AE9c7119927b4FaabbBd',
          mirroredVotingEscrow: '0xec378cdd60E890332F7A8CC251315327a4f244B6',
          votingEscrow: '0xAc8204a9d79CA87D192ea98A9381600642A66a5F',
          rewardPolicyMaker: '0xBa57440fA35Fdb671E58F6F56c1A4447aB1f6C2B',
          lpPriceOracle: '0x0b510A226F4A7A66c480988704eCd5306B6f1954',
          // multichain: {
          //   mirrorGate: '0x206eA32143b066a146990e2Aa4E5e8432C4a065E',
          //   endpoint: '0x37414a8662bC1D25be3ee51Fb27C2686e2490A89',
          // },
          isBaamGauges: false,
          isV1Escrow: false,
          isV1Controller: false,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
        // {
        //   type: 'hundredfinance',
        //   id: 'hundred-finance-kovan',
        //   name: 'Ethereum Kovan testnet',
        //   url: '',
        //   chainId: 42,
        //   gaugeProxyAddress: '0x2E08596F46f51d1E88207790270aF2BD94602762',
        //   mirroredVotingEscrow: '0xe8b56c41be2b39Db027Fb2e5f826E068A5F73FBe',
        //   votingEscrow: '0x08fd5fe792E9d14850Aa3Ca066Dbafbe15c6562C',
        //   rewardPolicyMaker: '0x6D5DD9C36Ac842eEd7Cb85a01FFD8d75C112407e',
        //   lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
        //   gauges: [],
        //   vaults: [],
        //   tokenMetadata: {},
        //   veTokenMetadata: {},
        //   otherTokenMetadata: {},
        //   useDays: false,
        //   maxDurationYears: 4,
        //   onload: null,
        // },
      ],
    };

    const that = this;

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE_GAUGES:
            that.configure(payload);
            break;
          case GET_PROJECTS:
            that.getProjects(payload);
            break;
          case GET_PROJECT:
            that.getProject(payload);
            break;
          case GET_TOKEN_BALANCES:
            that.getTokenBalances(payload);
            break;
          case LOCK:
            that.lock(payload);
            break;
          case WITHDRAW:
            that.unlock(payload);
            break;
          case APPROVE_LOCK:
            that.approveLock(payload);
            break;
          case VOTE:
            that.vote(payload);
            break;
          case INCREASE_LOCK_AMOUNT:
            that.increaseLockAmount(payload);
            break;
          case INCREASE_LOCK_DURATION:
            that.increaseLockDuration(payload);
            break;
          case APPLY_BOOST:
            that.applyBoost(payload);
            break;
          case MIRROR_LOCK:
            this.mirrorLock(payload);
            break;
          default: {
          }
        }
      }.bind(this),
    );
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(STORE_UPDATED);
  }

  chainName(id) {
    return NETWORKS_CONFIG.find((c) => parseInt(c.chainId, 16) === parseInt(id)).chainName;
  }

  async configure(payload) {
    const projects = this.getStore('projects');

    const web3 = await stores.accountStore.getWeb3Provider();
    let chainId = await web3?.eth?.getChainId();

    async.map(
      projects.filter((p) => p.chainId === chainId),
      (project, callback) => {
        this._getProjectData(
          project,
          projects.filter((p) => p.chainId !== project.chainId),
          callback,
        );
      },
      (err, project) => {
        if (err) {
          this.emitter.emit(ERROR);
          return;
        }
        const updatedProjects = projects.filter((p) => p.chainId !== chainId).concat(project);

        this.setStore({ projects: updatedProjects, configured: true });
        this.emitter.emit(GAUGES_CONFIGURED);
      },
    );
  }

  async _getProjectData(project, targetProjects, callback) {
    const web3 = await stores.accountStore.getWeb3Provider();
    const ethersProvider = await stores.accountStore.getEthersProvider();

    project.targetChainMirrorGates = [];
    project.targetChainIds = [];

    for (let i = 0; i < targetProjects.length; i++) {
      let p = targetProjects[i];
      if (project.targetChainMirrorGates.find((t) => t.chainId === p.chainId) === undefined) {
        if (p.layerZero !== undefined || p.multichain !== undefined) {
          project.targetChainMirrorGates.push({
            chainId: p.chainId,
            name: this.chainName(p.chainId),
            layerZero: p.layerZero,
            multichain: p.multichain,
            hasActiveMveHND: p.mirroredVotingEscrow !== undefined,
            mirroredVotingEscrow: p.mirroredVotingEscrow,
          });
        }
        project.targetChainIds.push(p.chainId);
      }
    }

    if (!web3 || !ethersProvider) {
      return;
    }

    const ethcallProvider = new Provider();
    await ethcallProvider.init(ethersProvider);

    if (project.multicallAddress) {
      ethcallProvider.multicall = { address: project.multicallAddress, block: 0 };
    }

    const hndPrice = await this._getHndPrice();

    const veTokenAddress = project.votingEscrow;
    const gaugeControllerMulticall = new Contract(project.gaugeProxyAddress, GAUGE_CONTROLLER_ABI);
    const escrowContract = new Contract(project.votingEscrow, VOTING_ESCROW_ABI);
    const mirroredVeTokenAddress = project.mirroredVotingEscrow ? project.mirroredVotingEscrow : veTokenAddress;

    const [totalWeight, tokenAddress, n_gauges] = await ethcallProvider.all([
      gaugeControllerMulticall.get_total_weight(),
      escrowContract.token(),
      gaugeControllerMulticall.n_gauges(),
    ]);

    // get how many gauges there are
    // const n_gauges = await gaugeControllerContract.methods.n_gauges().call();
    const tmpArr = [...Array(parseInt(n_gauges)).keys()];

    const tokenContract = new Contract(tokenAddress, ERC20_ABI);
    const mirroredVeTokenContract = new Contract(mirroredVeTokenAddress, ERC20_ABI);

    // get all the gauges
    const gaugesCall = [tokenContract.symbol(), tokenContract.decimals(), mirroredVeTokenContract.symbol(), mirroredVeTokenContract.decimals()];

    tmpArr.forEach((gauge, idx) => {
      gaugesCall.push(gaugeControllerMulticall.gauges(idx));
    });

    let gauges = await ethcallProvider.all(gaugesCall);

    const metadata = gauges.splice(0, 4);
    const tokenMetadata = { address: tokenAddress, symbol: metadata[0], decimals: metadata[1] };
    const veTokenMetadata = { address: mirroredVeTokenAddress, symbol: metadata[2], decimals: metadata[3] };

    // get the gauge relative weights

    const gaugesCalls = [];

    gauges.forEach((gauge) => {
      const gaugeContractMulticall = new Contract(gauge, GAUGE_ABI);
      gaugesCalls.push(
        gaugeControllerMulticall.get_gauge_weight(gauge),
        gaugeControllerMulticall.gauge_relative_weight(gauge, currentEpochTime()),
        gaugeControllerMulticall.gauge_relative_weight(gauge, nextEpochTime()),
        gaugeContractMulticall.lp_token(),
        gaugeContractMulticall.is_killed(),
      );
    });

    const gaugesData = await ethcallProvider.all(gaugesCalls);

    const gaugesWeights = [];
    const gaugesCurrentEpochRelativeWeights = [];
    const gaugesNextEpochRelativeWeights = [];
    let gaugesLPTokens = [];
    const isGaugeKilled = [];

    for (let i = 0; i < gauges.length; i++) {
      const data = gaugesData.splice(0, 5);
      isGaugeKilled.push(data[4]);
      gaugesWeights.push(data[0]);
      gaugesCurrentEpochRelativeWeights.push(data[1]);
      gaugesNextEpochRelativeWeights.push(data[2]);
      gaugesLPTokens.push(data[3]);
    }

    let baamGaugeLpTokens = [...gaugesLPTokens];
    if (project.isBaamGauges) {
      let baamLpCalls = [];
      gaugesLPTokens.forEach((lp, index) => {
        const lpContract = new Contract(lp, BAAM_ABI);
        baamLpCalls.push(lpContract.LUSD());
        baamLpCalls.push(lpContract.totalSupply());
      });
      baamGaugeLpTokens = await ethcallProvider.all(baamLpCalls);
    }

    const lpCalls = [];
    gaugesLPTokens.forEach((lp, index) => {
      const gaugeUnderlying = project.isBaamGauges ? baamGaugeLpTokens[index * 2] : lp;
      const priceOracleMulticall = new Contract(lpPriceOracle(project, gaugeUnderlying), PRICE_ORACLE_ABI);
      if (gauges[index].toLowerCase() !== project.nativeTokenGauge?.toLowerCase()) {
        const lpContract = new Contract(gaugeUnderlying, CTOKEN_ABI);
        lpCalls.push(
          priceOracleMulticall.getUnderlyingPrice(gaugeUnderlying),
          lpContract.exchangeRateStored(),
          lpContract.underlying(),
          lpContract.balanceOf(lp),
        );
      } else {
        const lpContract = new Contract(gaugeUnderlying, CETHER_ABI);
        lpCalls.push(priceOracleMulticall.getUnderlyingPrice(gaugeUnderlying), lpContract.exchangeRateStored(), lpContract.balanceOf(lp));
      }
    });

    const lpData = await ethcallProvider.all(lpCalls);
    const lpTokenUnderlyingInfo = gaugesLPTokens.map((lp, index) => {
      if (gauges[index].toLowerCase() !== project.nativeTokenGauge?.toLowerCase()) {
        const lptokenInfo = lpData.splice(0, 4);
        return {
          price: lptokenInfo[0],
          exchangeRate: project.isBaamGauges ? (lptokenInfo[1] * +lptokenInfo[3]) / +baamGaugeLpTokens[index * 2 + 1] : lptokenInfo[1],
          underlying: lptokenInfo[2],
        };
      } else {
        const lptokenInfo = lpData.splice(0, 3);
        return {
          price: lptokenInfo[0],
          nominalExchangeRate: lptokenInfo[1],
          exchangeRate: project.isBaamGauges ? (lptokenInfo[1] * +lptokenInfo[2]) / +baamGaugeLpTokens[index * 2 + 1] : lptokenInfo[1],
        };
      }
    });

    const lpTokensCalls = [];
    gaugesLPTokens.forEach((lp, index) => {
      const lpTokenContract = new Contract(lp, ERC20_ABI);
      if (gauges[index].toLowerCase() !== project.nativeTokenGauge?.toLowerCase()) {
        const lpUnderlyingTokenContract = new Contract(lpTokenUnderlyingInfo[index].underlying, ERC20_ABI);
        lpTokensCalls.push(
          lpTokenContract.name(),
          lpTokenContract.symbol(),
          lpTokenContract.decimals(),
          lpTokenContract.balanceOf(gauges[index]),
          lpUnderlyingTokenContract.decimals(),
          lpUnderlyingTokenContract.symbol(),
        );
      } else {
        lpTokensCalls.push(lpTokenContract.name(), lpTokenContract.symbol(), lpTokenContract.decimals(), lpTokenContract.balanceOf(gauges[index]));
      }
    });

    const lpTokensData = await ethcallProvider.all(lpTokensCalls);

    const lpTokens = gaugesLPTokens.map((gauge, index) => {
      if (gauges[index].toLowerCase() !== project.nativeTokenGauge?.toLowerCase()) {
        const data = lpTokensData.splice(0, 6);
        return { name: data[0], symbol: data[1], decimals: data[2], balance: data[3], underlyingDecimals: data[4], underlyingSymbol: data[5] };
      } else {
        const data = lpTokensData.splice(0, 4);
        return { name: data[0], symbol: data[1], decimals: data[2], balance: data[3], underlyingDecimals: 18, underlyingSymbol: project.nativeTokenSymbol };
      }
    });

    let projectGauges = [];
    for (let i = 0; i < gauges.length; i++) {
      let lpPrice = lpTokenUnderlyingInfo[i].price / 10 ** (36 - lpTokens[i].underlyingDecimals);
      let convRate = lpTokenUnderlyingInfo[i].exchangeRate / 1e18;

      const gauge = {
        address: gauges[i],
        weight: gaugesWeights[i] / 1e18,
        currentEpochRelativeWeight: (gaugesCurrentEpochRelativeWeights[i] * 100) / 1e18,
        nextEpochRelativeWeight: (gaugesNextEpochRelativeWeights[i] * 100) / 1e18,
        totalStakeBalance: (lpTokens[i].balance / 10 ** lpTokens[i].underlyingDecimals) * convRate,
        liquidityShare: 0,
        apr: 0,
        lpToken: {
          address: gaugesLPTokens[i],
          name: lpTokens[i].name,
          symbol: lpTokens[i].symbol,
          decimals: lpTokens[i].decimals,
          underlyingDecimals: lpTokens[i].underlyingDecimals,
          underlyingSymbol: lpTokens[i].underlyingSymbol,
          price: lpPrice,
          conversionRate: convRate,
        },
        isKilled: isGaugeKilled[i],
      };

      projectGauges.push(gauge);
    }

    const projectTokenMetadata = {
      address: web3.utils.toChecksumAddress(tokenMetadata.address),
      symbol: tokenMetadata.symbol,
      decimals: parseInt(tokenMetadata.decimals),
      logo: `/logo128.png`,
    };

    const projectVeTokenMetadata = {
      address: web3.utils.toChecksumAddress(veTokenMetadata.address),
      symbol: veTokenMetadata.symbol,
      decimals: parseInt(veTokenMetadata.decimals),
      logo: `https://assets.coingecko.com/coins/images/18445/thumb/hnd.PNG`,
    };

    project.totalWeight = totalWeight / 1e18;
    project.tokenMetadata = projectTokenMetadata;
    project.veTokenMetadata = projectVeTokenMetadata;
    project.gauges = projectGauges;
    project.hndPrice = hndPrice;

    callback(null, project);
  }

  async getProjects(payload) {
    const projects = await this._getProjects();

    this.emitter.emit(PROJECTS_RETURNED, projects);
  }

  async _getProjects() {
    // ...
    // get contract where we store projects
    // get project info
    // store them into the storage

    // for now just return stored projects
    return this.getStore('projects');
  }

  async getProject(payload) {
    const configured = this.getStore('configured');
    if (!configured) {
      return;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return null;
    }

    const projects = await this._getProjects();

    let project = projects.filter((project) => {
      return project.id === payload.content.id;
    });

    if (project.length > 0) {
      project = project[0];
    }

    this.emitter.emit(PROJECT_RETURNED, project);
  }

  async getTokenBalances(payload) {
    const configured = this.getStore('configured');
    if (!configured) {
      return;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    const provider = await stores.accountStore.getEthersProvider();
    if (!web3 || !provider) {
      return null;
    }

    const account = stores.accountStore.getStore('account');
    if (!account || !account.address) {
      return null;
    }

    const projects = await this._getProjects();

    let project = projects.filter((project) => {
      return project.id === payload.content.id;
    });

    if (project.length > 0) {
      project = project[0];
    }

    let mirror_transactions = [];
    let user_mirror_transactions = [];
    let storage = window.localStorage.getItem('mirror_transactions');
    if (storage) {
      mirror_transactions = mirror_transactions = JSON.parse(window.localStorage.getItem('mirror_transactions'));

      user_mirror_transactions = mirror_transactions.filter((t) => t.account === account.address && t.target.chainId === project.chainId && !t.bridged);
    }

    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    if (project.multicallAddress) {
      ethcallProvider.multicall = { address: project.multicallAddress, block: 0 };
    }

    const hasMveHnd = project.mirroredVotingEscrow !== undefined;
    const mirroredVeTokenAddress = project.mirroredVotingEscrow ? project.mirroredVotingEscrow : project.votingEscrow;

    const tokenContract = new Contract(project.tokenMetadata.address, ERC20_ABI);
    const veTokenContract = new Contract(project.votingEscrow, VOTING_ESCROW_ABI);
    const mirroredVeTokenContract = new Contract(mirroredVeTokenAddress, MIRRORED_VOTING_ESCROW_ABI);
    const rewardPolicyMakerContract = new Contract(project.rewardPolicyMaker, REWARD_POLICY_MAKER_ABI);
    const gaugeControllerContract = new Contract(project.gaugeProxyAddress, GAUGE_CONTROLLER_ABI);
    const gaugeControllerV2Contract = new Contract(project.gaugeProxyAddress, GAUGE_CONTROLLER_V2_ABI);

    const calls = [
      tokenContract.balanceOf(account.address),
      tokenContract.allowance(account.address, project.votingEscrow),
      tokenContract.balanceOf(mirroredVeTokenAddress),
      mirroredVeTokenContract.balanceOf(account.address),
      mirroredVeTokenContract.totalSupply(),
      veTokenContract.totalSupply(),
      veTokenContract.locked(account.address),
      veTokenContract.supply(),
      rewardPolicyMakerContract.rate_at(currentEpochTime()),
      rewardPolicyMakerContract.rate_at(nextEpochTime()),
      veTokenContract.balanceOf(account.address),
    ];

    project.gauges.forEach((gauge) => {
      const erc20Contract = new Contract(gauge.address, ERC20_ABI);
      const gaugeContract = new Contract(gauge.address, GAUGE_ABI);
      calls.push(
        project.mirroredVotingEscrow
          ? gaugeControllerV2Contract.vote_user_power_for_gauge(account.address, gauge.address)
          : gaugeControllerContract.vote_user_slopes(account.address, gauge.address),
        erc20Contract.balanceOf(account.address),
        gaugeContract.working_balances(account.address),
        gaugeContract.working_supply(),
        gaugeControllerContract.last_user_vote(account.address, gauge.address),
      );
    });

    if (hasMveHnd) {
      project.targetChainIds.forEach((id) => {
        calls.push(mirroredVeTokenContract.mirrored_locks(account.address, id, 0));
      });
    }

    if (project.layerZero) {
      const layerZeroEndpoint = new Contract(project.layerZero.endpoint, LAYER_ZERO_ENDPOINT_ABI);
      user_mirror_transactions.forEach((t) => {
        calls.push(
          layerZeroEndpoint.getInboundNonce(t.source.layerZero.endpointId, t.source.layerZero.mirrorGate),
          layerZeroEndpoint.hasStoredPayload(t.source.layerZero.endpointId, t.source.layerZero.mirrorGate),
        );
      });
    }

    const data = await ethcallProvider.all(calls);

    const tokenBalance = data[0];
    const allowance = data[1];
    const totalLocked = data[2];
    const veTokenBalance = data[3];
    const totalVeTokenSupply = data[4];
    const totalLocalVeTokenSupply = data[5];
    const userLocked = data[6];
    const supply = data[7];
    const currentRewardRate = data[8];
    const nextEpochRewardRate = data[9];
    const veTokenLocalBalance = data[10];

    data.splice(0, 11);

    const gaugesData = project.gauges.map(() => {
      const d = data.splice(0, 5);
      return {
        voteWeight: project.mirroredVotingEscrow ? d[0] : d[0].power,
        balanceOf: d[1],
        workingBalanceOf: d[2],
        workingSupply: d[3],
        lastUserVotes: d[4],
      };
    });

    project.mirrored_locks = [];

    if (hasMveHnd) {
      const d = data.splice(0, project.targetChainIds.length);
      let now = moment().unix();
      let maxLockEnd = moment().add(4, 'years').unix();
      d.forEach((l, index) => {
        if (l.end.toNumber() > now) {
          project.mirrored_locks.push({
            amount: (+ethers.utils.formatEther(l.amount.mul(l.end.toNumber() - now).div(maxLockEnd - now))).toFixed(2),
            chain: this.chainName(project.targetChainIds[index]),
          });
        }
      });
    }

    if (project.layerZero && user_mirror_transactions.length > 0) {
      let d = data.splice(0, user_mirror_transactions.length * 2);
      for (let i = 0; i < user_mirror_transactions.length; i++) {
        user_mirror_transactions[i].bridged =
          +d[i * 2] > +user_mirror_transactions[i].nonce || (+d[i * 2] === +user_mirror_transactions[i].nonce && !d[i * 2 + 1]);
      }
      project.locks_being_mirrored = user_mirror_transactions.filter((l) => !l.bridged);
    }

    window.localStorage.setItem('mirror_transactions', JSON.stringify(mirror_transactions.filter((t) => !t.bridged)));

    project.tokenMetadata.balance = BigNumber(ethers.utils.formatUnits(tokenBalance, project.tokenMetadata.decimals));
    project.tokenMetadata.allowance = BigNumber(ethers.utils.formatUnits(allowance, project.tokenMetadata.decimals));
    project.tokenMetadata.totalLocked = ethers.utils.formatUnits(totalLocked, project.tokenMetadata.decimals);

    project.veTokenMetadata.balance = (veTokenBalance / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.localBalance = (veTokenLocalBalance / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.totalSupply = (totalVeTokenSupply / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.totalLocalSupply = (totalLocalVeTokenSupply / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.userLocked = (userLocked.amount / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);

    project.veTokenMetadata.supply = (supply / 10 ** project.tokenMetadata.decimals).toFixed(project.tokenMetadata.decimals);

    project.veTokenMetadata.userLockAmount = userLocked.amount;
    project.veTokenMetadata.userLockEnd = userLocked.end;

    let totalPercentUsed = 0;

    for (let i = 0; i < project.gauges.length; i++) {
      project.gauges[i].balance = (gaugesData[i].balanceOf / 10 ** project.gauges[i].lpToken.underlyingDecimals) * project.gauges[i].lpToken.conversionRate;
      project.gauges[i].workingBalance = gaugesData[i].workingBalanceOf;
      project.gauges[i].workingSupply = gaugesData[i].workingSupply;
      project.gauges[i].rawBalance = gaugesData[i].balanceOf;
      project.gauges[i].boost = userBoost(project.gauges[i], veTokenBalance, totalVeTokenSupply);

      project.gauges[i].remainingBalance = userRemainingStake(
        project.gauges[i].balance,
        project.gauges[i].totalStakeBalance,
        veTokenBalance,
        totalVeTokenSupply,
        project.gauges[i].boost,
      );

      const gaugeVotePercent = gaugesData[i].voteWeight / 100;
      project.gauges[i].userVotesPercent = gaugeVotePercent.toFixed(2);
      totalPercentUsed = totalPercentUsed + gaugeVotePercent;

      project.gauges[i].liquidityShare = userAppliedLiquidityShare(project.gauges[i]);

      project.gauges[i].appliedBoost = userAppliedBoost(project.gauges[i]);
      project.gauges[i].needVeHndForMaxBoost =
        (project.gauges[i].balance * project.veTokenMetadata.totalSupply) / (project.gauges[i].totalStakeBalance - project.gauges[i].balance) -
        project.veTokenMetadata.balance;

      let providedLiquidity = project.gauges[i].balance * project.gauges[i].lpToken.price;

      let totalRewards = (currentRewardRate * 365 * 24 * 3600 * project.hndPrice) / 1e18;
      let gaugeRewards = (totalRewards * project.gauges[i].currentEpochRelativeWeight) / 100;
      let rewards = gaugeRewards * project.gauges[i].liquidityShare;

      let nextEpochTotalRewards = (nextEpochRewardRate * 365 * 24 * 3600 * project.hndPrice) / 1e18;
      let nextEpochGaugeRewards = (nextEpochTotalRewards * project.gauges[i].nextEpochRelativeWeight) / 100;
      let nextEpochRewards = nextEpochGaugeRewards * project.gauges[i].liquidityShare;

      if (providedLiquidity > 0) {
        project.gauges[i].apr = (rewards * 100) / providedLiquidity;
        project.gauges[i].nextEpochApr = (nextEpochRewards * 100) / providedLiquidity;
      }

      const referenceBalance = 10000;
      const referenceWorkingSupply =
        (project.gauges[i].workingSupply / 10 ** project.gauges[i].lpToken.underlyingDecimals) * project.gauges[i].lpToken.conversionRate;
      const referenceLiquidityShare = referenceBalance / (referenceWorkingSupply + referenceBalance);

      project.gauges[i].gaugeRewards = gaugeRewards;
      project.gauges[i].gaugeApr = (gaugeRewards * referenceLiquidityShare * 100) / (referenceBalance * project.gauges[i].lpToken.price);
      project.gauges[i].nextEpochGaugeApr = (nextEpochGaugeRewards * referenceLiquidityShare * 100) / (referenceBalance * project.gauges[i].lpToken.price);

      project.gauges[i].nextVoteTimestamp = +gaugesData[i].lastUserVotes === 0 ? 0 : +gaugesData[i].lastUserVotes + 10 * 86400;
    }

    project.userVotesPercent = totalPercentUsed.toFixed(2);

    project.nextEpochRewardsAreSet = +nextEpochRewardRate !== 0;

    let newProjects = projects.map((proj) => {
      if (proj.id === project.id) {
        return project;
      }

      return proj;
    });

    this.setStore({ projects: newProjects });

    this.emitter.emit(TOKEN_BALANCES_RETURNED, project);
  }

  async approveLock(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    const { amount, project } = payload.content;

    this._callApproveLock(web3, project, account, amount, (err, approveResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(APPROVE_LOCK_RETURNED, approveResult);
    });
  }

  async _callApproveLock(web3, project, account, amount, callback) {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, project.tokenMetadata.address);

    let amountToSend = '0';
    if (amount === 'max') {
      amountToSend = MAX_UINT256;
    } else {
      amountToSend = BigNumber(amount)
        .times(10 ** project.tokenMetadata.decimals)
        .toFixed(0);
    }

    await this._asyncCallContractWait(
      web3,
      tokenContract,
      'approve',
      [project.votingEscrow, amountToSend],
      account,
      null,
      GET_TOKEN_BALANCES,
      { id: project.id },
      callback,
    );
  }

  async lock(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    const { amount, selectedDate, project } = payload.content;

    this._callLock(web3, project, account, amount, selectedDate, (err, lockResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(LOCK_RETURNED, lockResult);
    });
  }

  async unlock(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    const { project } = payload.content;

    this._callUnlock(web3, project, account, (err, lockResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(WITHDRAW_RETURNED, lockResult);
    });
  }

  async _callLock(web3, project, account, amount, selectedDate, callback) {
    const escrowContract = new web3.eth.Contract(VOTING_ESCROW_ABI, project.votingEscrow);

    const amountToSend = BigNumber(amount)
      .times(10 ** project.tokenMetadata.decimals)
      .toFixed(0);

    await this._asyncCallContractWait(
      web3,
      escrowContract,
      'create_lock',
      [amountToSend, selectedDate],
      account,
      null,
      GET_TOKEN_BALANCES,
      { id: project.id },
      callback,
    );
  }

  async _callUnlock(web3, project, account, callback) {
    const escrowContract = new web3.eth.Contract(VOTING_ESCROW_ABI, project.votingEscrow);

    await this._asyncCallContractWait(web3, escrowContract, 'withdraw', [], account, null, GET_TOKEN_BALANCES, { id: project.id }, callback);
  }

  async vote(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    const { amount, gaugeAddress, project } = payload.content;

    this._calVoteForGaugeWeights(web3, project, account, amount, gaugeAddress, (err, voteResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(VOTE_RETURNED, voteResult);
    });
  }

  async _calVoteForGaugeWeights(web3, project, account, amount, gaugeAddress, callback) {
    const gaugeControllerContract = new web3.eth.Contract(GAUGE_CONTROLLER_ABI, project.gaugeProxyAddress);

    const amountToSend = (amount * 100).toFixed(0);

    await this._asyncCallContractWait(
      web3,
      gaugeControllerContract,
      'vote_for_gauge_weights',
      [gaugeAddress, amountToSend],
      account,
      null,
      GET_TOKEN_BALANCES,
      { id: project.id },
      callback,
    );
  }

  async increaseLockAmount(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    const { amount, project } = payload.content;

    this._callIncreaseAmount(web3, project, account, amount, (err, lockResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(INCREASE_LOCK_AMOUNT_RETURNED, lockResult);
    });
  }

  async _callIncreaseAmount(web3, project, account, amount, callback) {
    const escrowContract = new web3.eth.Contract(VOTING_ESCROW_ABI, project.votingEscrow);

    const amountToSend = BigNumber(amount)
      .times(10 ** project.tokenMetadata.decimals)
      .toFixed(0);

    await this._asyncCallContractWait(web3, escrowContract, 'increase_amount', [amountToSend], account, null, GET_TOKEN_BALANCES, { id: project.id }, callback);
  }

  async increaseLockDuration(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    let { selectedDate, project } = payload.content;

    // if (project.useDays) {
    //   selectedDate = moment.duration(moment.unix(selectedDate).diff(moment().startOf('day'))).asDays();
    // }

    this._callIncreaseUnlockTime(web3, project, account, selectedDate, (err, lockResult) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(INCREASE_LOCK_DURATION_RETURNED, lockResult);
    });
  }

  async applyBoost(payload) {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
      //maybe throw an error
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
      //maybe throw an error
    }

    let { gaugeAddress, project } = payload.content;

    const gaugeContract = new web3.eth.Contract(GAUGE_ABI, gaugeAddress);
    await this._asyncCallContractWait(
      web3,
      gaugeContract,
      'user_checkpoint',
      [account.address],
      account,
      null,
      GET_TOKEN_BALANCES,
      { id: project.id },
      (err, result) => {
        if (err) {
          return this.emitter.emit(ERROR, err);
        }
        return this.emitter.emit(APPLY_BOOST_RETURNED, result);
      },
    );
  }

  async _callIncreaseUnlockTime(web3, project, account, selectedDate, callback) {
    const escrowContract = new web3.eth.Contract(VOTING_ESCROW_ABI, project.votingEscrow);

    await this._asyncCallContractWait(
      web3,
      escrowContract,
      'increase_unlock_time',
      [selectedDate],
      account,
      null,
      WITHDRAW_RETURNED,
      { id: project.id },
      callback,
    );
  }

  async _asyncCallContractWait(web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchEventPayload, callback, value = undefined) {
    let sendPayload = {
      from: account.address,
    };
    if (value) {
      sendPayload.value = value;
    }

    await this._callContractWait(web3, contract, method, params, account, sendPayload, dispatchEvent, dispatchEventPayload, callback);
  }

  async _callContractWait(web3, contract, method, params, account, sendPayload, dispatchEvent, dispatchEventPayload, callback) {
    const context = this;

    let chainId = await web3?.eth?.getChainId();
    let chain = NETWORKS_CONFIG.find((chain) => parseInt(chain.chainId) === chainId);

    contract.methods[method](...params)
      .send(sendPayload)
      .on('transactionHash', function (hash) {
        context.emitter.emit(TX_SUBMITTED, { hash: hash, baseUrl: chain.blockExplorerUrls[0] });
      })
      .once('receipt', function (receipt) {
        callback(null, receipt.transactionHash, receipt);

        if (dispatchEvent) {
          context.dispatcher.dispatch({ type: dispatchEvent, content: dispatchEventPayload });
        }
      })
      .on('error', function (error) {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      })
      .catch((error) => {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  }

  async _getHndPrice() {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=hundred-finance&vs_currencies=usd';
      const headers = {};
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: headers,
      });
      const data = await response.json();
      const hnd = data ? data['hundred-finance'] : null;

      return hnd ? +hnd.usd : 0;
    } catch (err) {
      console.log(err);
    }
    return 0;
  }

  registerLockEvent(account, project, web3, target, error, hash, receipt) {
    if (receipt) {
      const abi = [
        { indexed: false, internalType: 'uint16', name: 'chainId', type: 'uint16' },
        { indexed: false, internalType: 'uint64', name: 'nonce', type: 'uint64' },
        { indexed: false, internalType: 'uint16', name: 'outboundProofType', type: 'uint16' },
        { indexed: false, internalType: 'bytes', name: 'adapterParams', type: 'bytes' },
      ];

      let event = receipt.events[0];
      let params = web3.eth.abi.decodeLog(abi, event.raw.data, event.raw.topics);

      let mirror_transactions = [];
      let storage = window.localStorage.getItem('mirror_transactions');
      if (storage) {
        mirror_transactions = JSON.parse(window.localStorage.getItem('mirror_transactions'));
      }

      mirror_transactions.push({
        account: account.address,
        source: {
          chainId: project.chainId,
          name: this.chainName(project.chainId),
          layerZero: project.layerZero,
        },
        target: target,
        nonce: params.nonce,
        bridged: false,
      });

      window.localStorage.setItem('mirror_transactions', JSON.stringify(mirror_transactions));
    }
  }

  async mirrorLock(payload) {
    let that = this;
    const { project, target } = payload.content;
    const web3 = await stores.accountStore.getWeb3Provider();
    const account = stores.accountStore.getStore('account');

    if (project.layerZero && target.layerZero) {
      const mirrorGate = new web3.eth.Contract(LAYER_ZERO_MIRROR_GATE_ABI, project.layerZero.mirrorGate);
      const fee = await estimateMirrorFee(project, target, account);
      await this._asyncCallContractWait(
        web3,
        mirrorGate,
        'mirrorLock',
        [target.layerZero.endpointId, 0, 500000],
        account,
        null,
        GET_TOKEN_BALANCES,
        { id: project.id },
        (error, hash, receipt) => that.registerLockEvent(account, project, web3, target, error, hash, receipt),
        fee,
      );
    } else if (project.multichain && target.multichain) {
      let mirrorGate = new web3.eth.Contract(MULTICHAIN_MIRROR_GATE_ABI, project.multichain.mirrorGate);
      if (target.chainId === 1666600000) {
        mirrorGate = new web3.eth.Contract(MULTICHAIN_MIRROR_GATE_V2_ABI, project.multichain.mirrorGateV2);
      }
      await this._asyncCallContractWait(
        web3,
        mirrorGate,
        'mirrorLock',
        [target.chainId, target.mirroredVotingEscrow, 0],
        account,
        null,
        GET_TOKEN_BALANCES,
        { id: project.id },
        (error, hash, receipt) => that.registerLockEvent(account, project, web3, target, error, hash, receipt),
        0,
      );
    }
  }
}

function userRemainingStake(balance, totalBalance, veTokenBalance, totalVeTokenSupply, boost) {
  let maxStake = (totalBalance * veTokenBalance) / totalVeTokenSupply;

  if (balance > maxStake) {
    return 0;
  }

  if ((isNaN(boost) || boost === 0) && balance === 0) {
    return maxStake;
  }

  return maxStake / (boost * 0.4) - balance;
}

function userLiquidityShare(gauge, balance, totalBalance, veTokenBalance, totalVeTokenSupply) {
  return (Math.min(balance * 0.4 + totalBalance * 0.6 * (veTokenBalance / totalVeTokenSupply), balance) * 100) / totalBalance;
}

function userBoost(gauge, veTokenBalance, totalVeTokenSupply) {
  return Math.min(
    userLiquidityShare(gauge, gauge.balance, gauge.totalStakeBalance, veTokenBalance, totalVeTokenSupply) /
      userLiquidityShare(gauge, gauge.balance, gauge.totalStakeBalance, 0, totalVeTokenSupply),
    2.5,
  );
}

function userAppliedBoost(gauge) {
  return (gauge.workingBalance * 2.5) / gauge.rawBalance;
}

function userAppliedLiquidityShare(gauge) {
  return gauge.workingBalance / gauge.workingSupply;
}

function lpPriceOracle(project, token) {
  let oracle = undefined;

  if (project.lpPriceOracles) {
    oracle = project.lpPriceOracles.find((o) => o.lp.toLowerCase() === token.toLowerCase())?.oracle;
  }

  if (!oracle) {
    oracle = project.lpPriceOracle;
  }

  return oracle;
}

async function estimateMirrorFee(project, target, account) {
  const ethersProvider = await stores.accountStore.getEthersProvider();
  const ethcallProvider = new Provider();
  await ethcallProvider.init(ethersProvider);

  const layerZeroEndpoint = new Contract(project.layerZero.endpoint, LAYER_ZERO_ENDPOINT_ABI);
  const call = layerZeroEndpoint.estimateFees(
    target.layerZero.endpointId,
    target.layerZero.mirrorGate,
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [account.address, project.chainId, 0, project.veTokenMetadata.userLockAmount.toString(), project.veTokenMetadata.userLockEnd.toString()],
    ),
    false,
    ethers.utils.solidityPack(['uint16', 'uint256'], [1, 500000]),
  );

  const fee = await ethcallProvider.all([call]);

  return fee[0].nativeFee;
}

export default Store;
