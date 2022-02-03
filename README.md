# Hundred voting

## Vesting + Gauges + Voting

- UI interacts with contracts defined in [hundred-finance/hundred-dao](https://github.com/hundred-finance/hundred-dao)
- Staking in gauges is not covered here and will be part of the main [hundred.finance](hundred.finance)

## Add new voting page

One config is needed. go to [gaugeStore.js](./stores/gaugeStore.js) and add a new project config
in `this.store.projects` array

```javascript
        {
          type: 'hundredfinance',
          id: 'hundred-finance-harmony',
          name: 'Harmony One',
          logo: '/logo128.png',
          url: '',
          chainId: <chain-id>,
          gaugeProxyAddress: <gauge-controller-address>,
          lpPriceOracle: <hundred-finance-price-oracle-address>,
          rewardPolicyMaker: <veHND-policy-maker-address>,
          gauges: [],
          vaults: [],
          tokenMetadata: {},
          veTokenMetadata: {},
          otherTokenMetadata: {},
          useDays: false,
          maxDurationYears: 4,
          onload: null
        }
```

A new project card should show up when loading the app

## Thanks

This project is forked from [chimera-defi/vetoken-voting](https://github.com/chimera-defi/veToken-voting)
