import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, TextField, InputAdornment, Button, Tooltip, CircularProgress,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency } from '../../utils';

import PieChart from './pieChart';
import GaugeVotesTable from './gaugeVotesTable';

import stores from '../../stores/index.js';
import { ERROR, VOTE, VOTE_RETURNED } from '../../stores/constants';

import classes from './gaugeVoting.module.css';

export default function GaugeVoting({ project }) {
  const [amount, setAmount] = useState(0);
  const [amountError, setAmountError] = useState(false);
  const [gauge, setGauge] = useState(null);
  const [gaugeError, setGaugeError] = useState(false);

  const [voteLoading, setVoteLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const voteReturned = () => {
      setVoteLoading(false);
      setResetLoading(false);
    };

    stores.emitter.on(VOTE_RETURNED, voteReturned);
    stores.emitter.on(ERROR, voteReturned);

    return () => {
      stores.emitter.removeListener(VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ERROR, voteReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    if (!project || !project.tokenMetadata) {
      return;
    }

    setAmount(project.tokenMetadata.balance.times(BigNumber(percent).div(BigNumber(100))).toFixed(project.tokenMetadata.decimals));
  };

  const onGaugeSelectChanged = (event, theOption) => {
    setGauge(theOption);
  };

  const onVote = () => {
    setAmountError(false);
    setGaugeError(false);
    let error = false;

    if (!gauge) {
      setGaugeError(true);
      error = true;
    }
    if (!amount || amount === '' || isNaN(amount) || amount > 100 || amount < 0) {
      setAmountError(true);
      error = true;
    }

    if (!error) {
      setVoteLoading(true);

      stores.dispatcher.dispatch({ type: VOTE, content: { gaugeAddress: gauge.address, amount, project } });
    }
  };

  const onReset = (gauge) => {
    setResetLoading(true);

    stores.dispatcher.dispatch({ type: VOTE, content: { gaugeAddress: gauge.address, amount: '0', project } });
  };

  const canVoteFor = (gauge) => !gauge || gauge.nextVoteTimestamp === 0 || gauge.nextVoteTimestamp <= moment().unix();

  return (
    <Paper elevation={1} className={classes.projectCardContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Gauge Voting
      </Typography>
      <div>
        <Typography variant="h5" className={classes.sectionHeader}>
          Vote for your gauge
        </Typography>
        <div className={classes.textField}>
          <div className={classes.inputTitleContainer}>
            <div className={classes.inputTitle}>
              <Typography variant="h5" noWrap>
                Select Gauge
              </Typography>
            </div>
          </div>
          <Autocomplete
            disableClearable
            options={project?.gauges}
            value={gauge}
            onChange={onGaugeSelectChanged}
            getOptionLabel={(option) => option.lpToken.symbol}
            fullWidth
            renderOption={(option, { selected }) => <div className={classes.text}>{option.lpToken.symbol}</div>}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  ...{
                    placeholder: 'Search gauge',
                  },
                }}
                variant="outlined"
              />
            )}
          />
        </div>

        <div className={classes.textField}>
          <div className={classes.inputTitleContainer}>
            <div className={classes.inputTitle}>
              <Typography variant="h5" noWrap>
                Vote Percent
              </Typography>
            </div>
          </div>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="0.00"
            value={amount}
            error={amountError}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
        </div>
        <div className={classes.actionButton}>
          <Button fullWidth disableElevation variant="contained" color="primary" size="large" onClick={onVote} disabled={voteLoading || !canVoteFor(gauge)}>
            {canVoteFor(gauge) ? (
              <Typography variant="h5">{voteLoading ? <CircularProgress size={15} /> : 'Vote'}</Typography>
            ) : (
              <Typography variant="h5">
                Vote disabled until
                {moment.unix(gauge?.nextVoteTimestamp).format('YYYY-MM-DD HH:mm')}
              </Typography>
            )}
          </Button>
        </div>
        <div className={classes.calculationResults}>
          <div className={classes.calculationResult}>
            <Typography variant="h3">Current voting power used: </Typography>
            <Typography variant="h3" className={classes.bold}>
              {formatCurrency(project?.userVotesPercent)}
              %
            </Typography>
          </div>
        </div>
        {project?.userVotesPercent > 0 && (
          <div className={classes.gaugeVotesTable}>
            {project?.gauges?.map((gauge, idx) => {
              if (!gauge.userVotesPercent || (gauge.userVotesPercent && gauge.userVotesPercent === 0)) {
                return null;
              }

              return (
                <div className={classes.vote_line} key={`gauge${idx}`}>
                  <div className={classes.calculationResult}>
                    <Typography variant="h5">{gauge.lpToken.name}</Typography>
                    <Typography variant="h5" className={classes.bold}>
                      {formatCurrency(gauge.userVotesPercent)}
                      %
                    </Typography>
                  </div>
                  <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      onReset(gauge);
                    }}
                    disabled={resetLoading || !canVoteFor(gauge)}
                  >
                    <Typography variant="h5">{resetLoading ? <CircularProgress size={15} /> : 'Reset gauge'}</Typography>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        {project?.userVotesPercent === 0 && (
          <div className={classes.gaugeVotesTable}>
            <Typography>
              Voting for a gauge increases the emissions that the farm receives. The more votes that your farm receives, the more profitable it will be.
            </Typography>
          </div>
        )}
      </div>
    </Paper>
  );
}
