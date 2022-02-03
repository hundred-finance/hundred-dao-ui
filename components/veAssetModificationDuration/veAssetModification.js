import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, InputAdornment, Button, Tooltip, Radio, RadioGroup, FormControlLabel, CircularProgress } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import { formatCurrency, normalizeDate } from '../../utils';
import moment from 'moment';

import stores from '../../stores/index.js';
import { ERROR, INCREASE_LOCK_DURATION, INCREASE_LOCK_DURATION_RETURNED, WITHDRAW, WITHDRAW_RETURNED } from '../../stores/constants';

import classes from './veAssetModification.module.css';

export default function VeAssetGeneration({ project }) {
  const [lockLoading, setLockLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('month');

  useEffect(function () {
    const lockReturned = () => {
      setLockLoading(false);
    };

    stores.emitter.on(INCREASE_LOCK_DURATION_RETURNED, lockReturned);
    stores.emitter.on(WITHDRAW_RETURNED, lockReturned);
    stores.emitter.on(ERROR, lockReturned);

    return () => {
      stores.emitter.removeListener(INCREASE_LOCK_DURATION_RETURNED, lockReturned);
      stores.emitter.removeListener(ERROR, lockReturned);
    };
  }, []);

  const handleDateChange = (event) => {
    setSelectedDate(normalizeDate(event.target.value));
    setSelectedValue(null);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;
      case '2year':
        days = 365 * 2;
        break;
      case '3year':
        days = 365 * 3;
        break;
      case 'years':
        days = 1461;
        break;
      default:
    }
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');

    setSelectedDate(normalizeDate(newDate));
  };

  const onLock = () => {
    setSelectedDateError(false);
    let error = false;

    if (!selectedDate) {
      setSelectedDateError(true);
      error = true;
    }

    if (!error) {
      setLockLoading(true);

      let selectedDateUnix = moment(selectedDate).unix();
      if (project.useDays) {
        selectedDateUnix = moment.duration(moment.unix(selectedDateUnix).diff(moment().startOf('day'))).asDays();
      }

      stores.dispatcher.dispatch({ type: INCREASE_LOCK_DURATION, content: { selectedDate: selectedDateUnix, project } });
    }
  };

  const onUnlock = () => {
    setLockLoading(true);
    stores.dispatcher.dispatch({ type: WITHDRAW, content: { project } });
  };

  return (
    <Paper elevation={1} className={classes.projectCardContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Increase lock duration
      </Typography>
      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Relock until
            </Typography>
          </div>
        </div>
        <TextField
          fullWidth
          id="date"
          type="date"
          variant="outlined"
          className={classes.textField}
          onChange={handleDateChange}
          value={selectedDate}
          error={selectedDateError}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Relock for{' '}
              {isLockIncreasePossible(project, selectedDate) ? `(new veHND balance: ${projectedVeHndBalance(project, selectedDate).toFixed(2)})` : ''}
            </Typography>
          </div>
        </div>
        <RadioGroup row aria-label="position" name="position" onChange={handleChange} value={selectedValue}>
          <FormControlLabel value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="bottom" />
          <FormControlLabel value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="bottom" />
          <FormControlLabel value="2year" control={<Radio color="primary" />} label="2 years" labelPlacement="bottom" />
          {project?.maxDurationYears === 3 ? (
            <FormControlLabel value="3year" control={<Radio color="primary" />} label="3 years" labelPlacement="bottom" />
          ) : (
            <FormControlLabel value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="bottom" />
          )}
        </RadioGroup>
      </div>
      <div className={classes.textField}>
        Current lock ends on <span style={{ color: '#26ff91' }}>{moment.unix(project?.veTokenMetadata?.userLockEnd).toString()}</span>
      </div>
      <div className={classes.actionButton}>
        <Button
          fullWidth
          disableElevation
          variant="contained"
          color="primary"
          size="large"
          onClick={onLock}
          disabled={lockLoading || !isLockIncreasePossible(project, selectedDate)}
          className={classes.button}
        >
          <Typography variant="h5">{lockLoading ? <CircularProgress size={15} /> : `Increase ${project?.tokenMetadata?.symbol} Lock`}</Typography>
        </Button>
      </div>
      <div className={classes.textField}>
        Currently locked HND <span style={{ color: '#26ff91' }}>{(+project?.veTokenMetadata?.userLocked).toFixed(2)}</span>
      </div>
      <div className={classes.actionButton}>
        <Button
          fullWidth
          disableElevation
          variant="contained"
          color="primary"
          size="large"
          onClick={onUnlock}
          disabled={lockLoading || !isUnLockPossible(project)}
          className={classes.button}
        >
          <Typography variant="h5">{lockLoading ? <CircularProgress size={15} /> : `Unlock HND`}</Typography>
        </Button>
      </div>
    </Paper>
  );
}

function isLockIncreasePossible(project, selectedDate) {
  return project && project.veTokenMetadata && project.veTokenMetadata.userLocked > 0 && moment(selectedDate).unix() >= project.veTokenMetadata.userLockEnd;
}

function isUnLockPossible(project) {
  return project && project.veTokenMetadata && project.veTokenMetadata.userLocked > 0 && moment().unix() >= project.veTokenMetadata.userLockEnd;
}

function projectedVeHndBalance(project, selectedDate) {
  let oldLockEnd = project.veTokenMetadata.userLockEnd;
  let newLockEnd = moment(selectedDate).unix();
  if (newLockEnd > oldLockEnd) {
    let now = moment().unix();
    let maxLockEnd = moment().add(4, 'years').unix();
    return (+project.veTokenMetadata.userLocked * (newLockEnd - now)) / (maxLockEnd - now);
  }
  return +project.veTokenMetadata.userLocked;
}
