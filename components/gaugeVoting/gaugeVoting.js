import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';

import stores from '../../stores/index.js';
import { ERROR, VOTE, VOTE_RETURNED } from '../../stores/constants';

import classes from './gaugeVoting.module.css';
import moment from 'moment';

export default function GaugeVoting({ project }) {
  const [amount, setAmount] = useState(0);
  const [amountError, setAmountError] = useState(false);
  const [gauge, setGauge] = useState(null);
  const [gaugeError, setGaugeError] = useState(false);

  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(function () {
    const voteReturned = () => {
      setVoteLoading(false);
    };

    stores.emitter.on(VOTE_RETURNED, voteReturned);
    stores.emitter.on(ERROR, voteReturned);

    return () => {
      stores.emitter.removeListener(VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ERROR, voteReturned);
    };
  }, []);

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
    if (amount === undefined || isNaN(amount) || amount > 100 || amount < 0) {
      setAmountError(true);
      error = true;
    }

    if (!error) {
      setVoteLoading(true);

      stores.dispatcher.dispatch({ type: VOTE, content: { gaugeAddress: gauge.address, amount, project } });
    }
  };

  const canVoteFor = (project, gauge) => {
    return !project?.isV1Controller || !gauge || gauge.nextVoteTimestamp === 0 || gauge.nextVoteTimestamp <= moment().unix();
  };

  //10 days cooldown
  function Countdown() {
    const timeDiff = () => {
      let diff = moment.duration(moment.unix(gauge?.nextVoteTimestamp).diff(moment()));
      let days = Math.trunc(diff.asDays());
      let hours = Math.trunc(diff.asHours() % 24);

      let minutes = Math.trunc(diff.asMinutes() % 60);
      let seconds = Math.trunc(diff.asSeconds() % 60);

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
      <div>
        <Typography variant="h5">Vote begins in {timeToNextEpoch}</Typography>
      </div>
    );
  }

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
            disableClearable={true}
            options={project?.gauges}
            value={gauge}
            onChange={onGaugeSelectChanged}
            getOptionLabel={(option) => `${option.lpToken.symbol} ${option.isKilled ? '(inactive)' : ''}`}
            fullWidth={true}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <div className={classes.text}>{`${option.lpToken.symbol} ${option.isKilled ? '(inactive)' : ''}`}</div>
              </React.Fragment>
            )}
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
          <Button
            fullWidth
            disableElevation
            variant="contained"
            color="primary"
            size="large"
            onClick={onVote}
            disabled={voteLoading || !canVoteFor(project, gauge)}
          >
            {canVoteFor(project, gauge) ? <Typography variant="h5">{voteLoading ? <CircularProgress size={15} /> : 'Vote'}</Typography> : <Countdown />}
          </Button>
        </div>
        <div className={classes.calculationResults}>
          <div className={classes.calculationResult}>
            <Typography variant="h3">Current voting power used: </Typography>
            <Typography variant="h3" className={classes.bold}>
              {formatCurrency(project?.userVotesPercent)}%
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
                <div className={classes.vote_line} key={'gauge' + idx}>
                  <Typography variant="h5">{gauge.lpToken.name}</Typography>
                  <Typography variant="h5" className={classes.calculationResult}>
                    {formatCurrency(gauge.userVotesPercent)}%
                  </Typography>
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
