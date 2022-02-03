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
} from './constants';

import { ERC20_ABI, GAUGE_CONTROLLER_ABI, GAUGE_ABI, VOTING_ESCROW_ABI, GAUGE_CONTROLLER_V2_ABI } from './abis';

import stores from './';
import BigNumber from 'bignumber.js';
import { PRICE_ORACLE_ABI } from './abis/HundredFinancePriceOracleABI';
import { CTOKEN_ABI } from './abis/CtokenABI';
import { REWARD_POLICY_MAKER_ABI } from './abis/RewardPolicyMaker';
import { NETWORKS_CONFIG } from './connectors';
import { Contract, Provider } from 'ethcall';
import { ethers } from 'ethers';

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
          gaugeProxyAddress: '0xb4BAfc3d60662De362c0cB0f5e2DE76603Ea77D7',
          votingEscrow: '0xBa57440fA35Fdb671E58F6F56c1A4447aB1f6C2B',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          rewardPolicyMaker: '0x3A4148DDDd121fbceD8717CB7B82370Be27F76bf',
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
          gaugeProxyAddress: '0xb1c4426C86082D91a6c097fC588E5D5d8dD1f5a8',
          votingEscrow: '0x376020c5B0ba3Fd603d7722381fAA06DA8078d8a',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          rewardPolicyMaker: '0x772918d032cFd4Ff09Ea7Af623e56E2D8D96bB65',
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
          gaugeProxyAddress: '0xa8cD5D59827514BCF343EC19F531ce1788Ea48f8',
          votingEscrow: '0xE4e43864ea18d5E5211352a4B810383460aB7fcC',
          lpPriceOracle: '0x10010069de6bd5408a6ded075cf6ae2498073c73',
          rewardPolicyMaker: '0xEdBA32185BAF7fEf9A26ca567bC4A6cbe426e499',
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
          gaugeProxyAddress: '0xb4300e088a3AE4e624EE5C71Bc1822F68BB5f2bc',
          votingEscrow: '0x243E33aa7f6787154a8E59d3C27a66db3F8818ee',
          lpPriceOracle: '0x10010069de6bd5408a6ded075cf6ae2498073c73',
          rewardPolicyMaker: '0xa8cD5D59827514BCF343EC19F531ce1788Ea48f8',
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
          id: 'hundred-finance-kovan',
          name: 'Ethereum Kovan testnet',
          url: '',
          chainId: 42,
          gaugeProxyAddress: '0xd6Cafd6d475A790634a548d7f43a6e420247BA61',
          mirroredVotingEscrow: '0x44F288e2405D9D62Eb43F5E3f1eD8147bF502A9a',
          votingEscrow: '0xbeD8EFa1973F6E1fB3515bf94aa760174431b3F8',
          lpPriceOracle: '0x10010069DE6bD5408A6dEd075Cf6ae2498073c73',
          rewardPolicyMaker: '0x6aDd45C2759fba789031370a8544A33C33E2335d',
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null,
        },
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
    console.log(this.store);
    return this.emitter.emit(STORE_UPDATED);
  }

  async configure(payload) {
    const projects = this.getStore('projects');

    const web3 = await stores.accountStore.getWeb3Provider();
    let chainId = await web3?.eth?.getChainId();

    async.map(
      projects.filter((p) => p.chainId === chainId),
      (project, callback) => {
        this._getProjectData(project, callback);
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

  async _getProjectData(project, callback) {
    const web3 = await stores.accountStore.getWeb3Provider();
    const ethersProvider = await stores.accountStore.getEthersProvider();

    if (!web3 || !ethersProvider) {
      return;
    }

    const ethcallProvider = new Provider();
    await ethcallProvider.init(ethersProvider);

    if (project.multicallAddress) {
      ethcallProvider.multicall = { address: project.multicallAddress, block: 0 };
    }

    const hndPrice = await this._getHndPrice();

    const gaugeControllerMulticall = new Contract(project.gaugeProxyAddress, GAUGE_CONTROLLER_ABI);
    const veTokenAddress = project.votingEscrow;
    const mirroredVeTokenAddress = project.mirroredVotingEscrow ? project.mirroredVotingEscrow : veTokenAddress;

    const priceOracleMulticall = new Contract(project.lpPriceOracle, PRICE_ORACLE_ABI);

    const [totalWeight, tokenAddress, n_gauges] = await ethcallProvider.all([
      gaugeControllerMulticall.get_total_weight(),
      gaugeControllerMulticall.token(),
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
    const gaugesLPTokens = [];
    const activeGauges = [];

    for (let i = 0; i < gauges.length; i++) {
      const data = gaugesData.splice(0, 5);
      const isGaugeKilled = data[4];
      if (!isGaugeKilled) {
        gaugesWeights.push(data[0]);
        gaugesCurrentEpochRelativeWeights.push(data[1]);
        gaugesNextEpochRelativeWeights.push(data[2]);
        gaugesLPTokens.push(data[3]);
        activeGauges.push(gauges[i]);
      }
    }

    const lpCalls = [];
    gaugesLPTokens.forEach((lp) => {
      const lpContract = new Contract(lp, CTOKEN_ABI);
      lpCalls.push(priceOracleMulticall.getUnderlyingPrice(lp), lpContract.exchangeRateStored(), lpContract.underlying());
    });

    const lpData = await ethcallProvider.all(lpCalls);
    const lpTokenUnderlyingInfo = gaugesLPTokens.map((lp, index) => {
      const lptokenInfo = lpData.splice(0, 3);
      return { price: lptokenInfo[0], exchangeRate: lptokenInfo[1], underlying: lptokenInfo[2] };
    });

    const lpTokensCalls = [];
    gaugesLPTokens.forEach((lp, index) => {
      const lpTokenContract = new Contract(lp, ERC20_ABI);
      const lpUnderlyingTokenContract = new Contract(lpTokenUnderlyingInfo[index].underlying, ERC20_ABI);

      lpTokensCalls.push(
        lpTokenContract.name(),
        lpTokenContract.symbol(),
        lpTokenContract.decimals(),
        lpTokenContract.balanceOf(activeGauges[index]),
        lpUnderlyingTokenContract.decimals(),
        lpUnderlyingTokenContract.symbol(),
      );
    });

    const lpTokensData = await ethcallProvider.all(lpTokensCalls);

    const lpTokens = gaugesLPTokens.map((gauge, index) => {
      const data = lpTokensData.splice(0, 6);
      return { name: data[0], symbol: data[1], decimals: data[2], balance: data[3], underlyingDecimals: data[4], underlyingSymbol: data[5] };
    });

    let projectGauges = [];
    for (let i = 0; i < activeGauges.length; i++) {
      let lpPrice = lpTokenUnderlyingInfo[i].price / 10 ** (36 - lpTokens[i].underlyingDecimals);
      let convRate = lpTokenUnderlyingInfo[i].exchangeRate / 1e18;

      const gauge = {
        address: activeGauges[i],
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

    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    if (project.multicallAddress) {
      ethcallProvider.multicall = { address: project.multicallAddress, block: 0 };
    }

    const mirroredVeTokenAddress = project.mirroredVotingEscrow ? project.mirroredVotingEscrow : project.votingEscrow;

    const tokenContract = new Contract(project.tokenMetadata.address, ERC20_ABI);
    const veTokenContract = new Contract(project.votingEscrow, VOTING_ESCROW_ABI);
    const mirroredVeTokenContract = new Contract(mirroredVeTokenAddress, VOTING_ESCROW_ABI);
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

    data.splice(0, 10);

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

    project.tokenMetadata.balance = BigNumber(ethers.utils.formatUnits(tokenBalance, project.tokenMetadata.decimals));
    project.tokenMetadata.allowance = (allowance / 10 ** project.tokenMetadata.decimals).toFixed(project.tokenMetadata.decimals);
    project.tokenMetadata.totalLocked = (totalLocked / 10 ** project.tokenMetadata.decimals).toFixed(project.tokenMetadata.decimals);

    project.veTokenMetadata.balance = (veTokenBalance / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.totalSupply = (totalVeTokenSupply / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.totalLocalSupply = (totalLocalVeTokenSupply / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);
    project.veTokenMetadata.userLocked = (userLocked.amount / 10 ** project.veTokenMetadata.decimals).toFixed(project.veTokenMetadata.decimals);

    project.veTokenMetadata.supply = (supply / 10 ** project.tokenMetadata.decimals).toFixed(project.tokenMetadata.decimals);

    project.veTokenMetadata.userLockEnd = userLocked.end;

    let totalPercentUsed = 0;

    for (let i = 0; i < project.gauges.length; i++) {
      project.gauges[i].balance = (gaugesData[i].balanceOf / 10 ** project.gauges[i].lpToken.underlyingDecimals) * project.gauges[i].lpToken.conversionRate;
      project.gauges[i].workingBalance = gaugesData[i].workingBalanceOf;
      project.gauges[i].workingSupply = gaugesData[i].workingSupply;
      project.gauges[i].rawBalance = gaugesData[i].balanceOf;

      project.gauges[i].remainingBalance = userRemainingStake(
        project.gauges[i].balance,
        project.gauges[i].totalStakeBalance,
        veTokenBalance,
        totalVeTokenSupply,
      );

      const gaugeVotePercent = gaugesData[i].voteWeight / 100;
      project.gauges[i].userVotesPercent = gaugeVotePercent.toFixed(2);
      totalPercentUsed = totalPercentUsed + gaugeVotePercent;

      project.gauges[i].liquidityShare = userAppliedLiquidityShare(project.gauges[i]);
      project.gauges[i].boost = userBoost(project.gauges[i], veTokenBalance, totalVeTokenSupply);
      project.gauges[i].appliedBoost = userAppliedBoost(project.gauges[i]);
      project.gauges[i].needVeHndForMaxBoost =
        (project.gauges[i].balance * project.veTokenMetadata.totalSupply) / (project.gauges[i].totalStakeBalance - project.gauges[i].balance) -
        project.veTokenMetadata.balance;

      let providedLiquidity = project.gauges[i].balance * project.gauges[i].lpToken.price;
      let totalProvidedLiquidity = project.gauges[i].totalStakeBalance * project.gauges[i].lpToken.price;

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
    console.log('amount');
    console.log(amount);

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

    console.log('amount to send');
    console.log(amountToSend);

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

    console.log(gaugeControllerContract);
    console.log('vote_for_gauge_weights');
    console.log([gaugeAddress, amountToSend]);

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

  async _asyncCallContractWait(web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchEventPayload, callback) {
    let sendPayload = {
      from: account.address,
    };

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
      .on('receipt', function (receipt) {
        console.log(receipt);
        callback(null, receipt.transactionHash);

        if (dispatchEvent) {
          console.log('dispatching new event');
          console.log(dispatchEvent);
          console.log(dispatchEventPayload);
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
}

function userRemainingStake(balance, totalBalance, veTokenBalance, totalVeTokenSupply) {
  let currentStake = balance;

  let maxStake = (totalBalance * veTokenBalance) / totalVeTokenSupply;

  // console.log(
  //   balance.toString(),
  //   totalBalance.toString(),
  //   veTokenBalance.toString(),
  //   totalVeTokenSupply.toString(),
  //   maxStake.toString()
  // )

  if (currentStake > maxStake) {
    return 0;
  }

  return maxStake - currentStake;
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

export default Store;
