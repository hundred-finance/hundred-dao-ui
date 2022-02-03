import React, { useState, useEffect } from 'react';

import {
  Typography, Paper, TextField, InputAdornment, Grid,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import classes from './balances.module.css';

import stores from '../../stores/index.js';
import {
  VAULTS_UPDATED, ETHERSCAN_URL, LEND_UPDATED, CONFIGURE_RETURNED,
} from '../../stores/constants';

import { formatCurrency, formatAddress } from '../../utils';

const WEEK = 604800;
const currentEpochTime = () => Math.floor(new Date().getTime() / 1000);
const nextEpochTime = () => Math.floor(currentEpochTime() / WEEK) * WEEK + WEEK;

function Balances({ project }) {
  const timeDiff = () => {
    const diff = moment.duration(moment.unix(nextEpochTime()).diff(moment()));
    const days = Math.trunc(diff.asDays());
    const hours = Math.trunc(diff.asHours() % 24);
    const minutes = Math.trunc(diff.asMinutes() % 60);
    const seconds = Math.trunc(diff.asSeconds() % 60);

    let diffString = '';

    if (days) {
      diffString += `${days}d`;
    }

    if (hours) {
      diffString += ` ${hours}h`;
    }

    if (minutes) {
      diffString += ` ${minutes}m`;
    }

    if (seconds) {
      diffString += ` ${seconds}s`;
    }

    return diffString;
  };

  const [timeToNextEpoch, setTimeToNextEpoch] = useState(timeDiff());

  useEffect(() => {
    const timer = setTimeout(() => setTimeToNextEpoch(timeDiff()), 1000);
    return () => clearTimeout(timer);
  });

  return (
    <Paper elevation={1} className={classes.overviewContainer}>
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">
            {project?.tokenMetadata?.symbol}
            {' '}
            price
          </Typography>
          <Typography variant="h3">{!project?.hndPrice ? <Skeleton style={{ minWidth: '200px ' }} /> : `$${formatCurrency(project?.hndPrice, 2)}`}</Typography>
        </div>
      </div>
      <div className={classes.separator} />
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">
            {project?.tokenMetadata?.symbol}
            {' '}
            balance
          </Typography>
          <Typography variant="h3">
            {!project?.tokenMetadata?.balance ? <Skeleton style={{ minWidth: '200px ' }} /> : `${formatCurrency(project?.tokenMetadata?.balance, 4)}`}
          </Typography>
        </div>
      </div>
      <div className={classes.separator} />
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">
            {project?.veTokenMetadata?.symbol}
            {' '}
            balance
          </Typography>
          <Typography variant="h3">
            {!project?.veTokenMetadata?.balance ? <Skeleton style={{ minWidth: '200px ' }} /> : `${formatCurrency(project?.veTokenMetadata?.balance, 4)}`}
          </Typography>
        </div>
      </div>
      <div className={classes.separator} />
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">
            Total
            {project?.veTokenMetadata?.symbol}
          </Typography>
          <Typography variant="h3">
            {!project ? <Skeleton style={{ minWidth: '200px ' }} /> : `${formatCurrency(project?.veTokenMetadata?.totalSupply, 0)}`}
          </Typography>
        </div>
      </div>
      <div className={classes.separator} />
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">
            Total
            {project?.tokenMetadata?.symbol}
            {' '}
            staked
          </Typography>
          <Typography variant="h3">
            {!project ? <Skeleton style={{ minWidth: '200px ' }} /> : `${formatCurrency(project?.veTokenMetadata?.supply, 0)}`}
          </Typography>
        </div>
      </div>
      <div className={classes.separator} />
      <div className={classes.overviewCard}>
        <div>
          <Typography variant="h5">Epoch ends in</Typography>
          <Typography variant="h3">{timeToNextEpoch}</Typography>
        </div>
      </div>
    </Paper>
  );
}

export default Balances;
