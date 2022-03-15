import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, InputAdornment, Button, Tooltip, Radio, RadioGroup, FormControlLabel, CircularProgress } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import { formatCurrency, normalizeDate } from '../../utils';
import moment from 'moment';

import stores from '../../stores/index.js';
import { ERROR, LOCK, LOCK_RETURNED, APPROVE_LOCK, APPROVE_LOCK_RETURNED, GET_PROJECT } from '../../stores/constants';

import classes from './veAssetGeneration.module.css';

export default function VeAssetGeneration({ project }) {
  const [approveLoading, setApproveLoading] = useState(false);
  const [revokeApproveLoading, setRevokeApproveLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('month');

  useEffect(function () {
    const lockReturned = () => {
      setLockLoading(false);
      setApproveLoading(false);
      setRevokeApproveLoading(false);

      stores.dispatcher.dispatch({ type: GET_PROJECT, content: { id: project.id } });
    };

    stores.emitter.on(LOCK_RETURNED, lockReturned);
    stores.emitter.on(APPROVE_LOCK_RETURNED, lockReturned);
    stores.emitter.on(ERROR, lockReturned);

    return () => {
      stores.emitter.removeListener(LOCK_RETURNED, lockReturned);
      stores.emitter.removeListener(APPROVE_LOCK_RETURNED, lockReturned);
      stores.emitter.removeListener(ERROR, lockReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    if (!project || !project.tokenMetadata) {
      return;
    }

    setAmount(project.tokenMetadata.balance.times(BigNumber(percent).div(BigNumber(100))).toFixed(project.tokenMetadata.decimals));
  };

  const handleChangeAmount = (e) => {
    console.log(e);
  };

  const handleDateChange = (event) => {
    setSelectedDate(normalizeDate(event.target.value));
    setSelectedValue(null);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    let newDate;

    switch (event.target.value) {
      case 'month':
        newDate = moment().add(1, 'months').format('YYYY-MM-DD');
        break;
      case 'year':
        newDate = moment().add(1, 'years').format('YYYY-MM-DD');
        break;
      case '2year':
        newDate = moment().add(2, 'years').format('YYYY-MM-DD');
        break;
      default:
        newDate = moment().add(4, 'years').subtract(1, 'days').format('YYYY-MM-DD');
    }

    setSelectedDate(normalizeDate(newDate));
  };

  const onLock = () => {
    setAmountError(false);
    setSelectedDateError(false);
    let error = false;

    if (!selectedDate) {
      setSelectedDateError(true);
      error = true;
    }
    if (!amount || amount === '') {
      setAmountError(true);
      error = true;
    }

    if (!error) {
      setLockLoading(true);

      let selectedDateUnix = moment(selectedDate).unix();
      if (project.useDays) {
        selectedDateUnix = moment.duration(moment.unix(selectedDateUnix).diff(moment().startOf('day'))).asDays();
      }

      stores.dispatcher.dispatch({ type: LOCK, content: { selectedDate: selectedDateUnix, amount, project } });
    }
  };

  const onApprove = () => {
    setAmountError(false);
    setSelectedDateError(false);
    let error = false;

    if (!amount || amount === '') {
      setAmountError(true);
      error = true;
    }

    if (!error) {
      setApproveLoading(true);
      stores.dispatcher.dispatch({ type: APPROVE_LOCK, content: { amount: 'max', project } });
    }
  };

  const onRevokeApprove = () => {
    setAmountError(false);
    setSelectedDateError(false);
    setRevokeApproveLoading(true);
    stores.dispatcher.dispatch({ type: APPROVE_LOCK, content: { amount: BigNumber(0), project } });
  };

  return (
    <Paper elevation={1} className={classes.projectCardContainer}>
      <Typography variant="h2" className={classes.sectionHeader}>
        Generate {project && project.veTokenMetadata ? project.veTokenMetadata.symbol : 'veAsset'}
      </Typography>

      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Your {project?.tokenMetadata?.symbol} Balance
            </Typography>
          </div>
          <div className={classes.balances}>
            <Typography
              variant="h5"
              onClick={() => {
                setAmountPercent(100);
              }}
              className={classes.value}
              noWrap
            >
              Balance: {formatCurrency(project?.tokenMetadata?.balance)}
            </Typography>
          </div>
        </div>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="0.00"
          value={amount}
          error={amountError}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={project?.tokenMetadata?.logo} alt="" width={30} height={30} />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Lock until
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
              Lock for
            </Typography>
          </div>
        </div>
        <RadioGroup row aria-label="position" name="position" onChange={handleChange} value={selectedValue}>
          <FormControlLabel value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="bottom" />
          <FormControlLabel value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="bottom" />
          <FormControlLabel value="2year" control={<Radio color="primary" />} label="2 years" labelPlacement="bottom" />
          {project?.maxDurationYears == 3 ? (
            <FormControlLabel value="3year" control={<Radio color="primary" />} label="3 years" labelPlacement="bottom" />
          ) : (
            <FormControlLabel value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="bottom" />
          )}
        </RadioGroup>
      </div>

      <div className={classes.actionButton}>
        <Button
          fullWidth
          disableElevation
          variant="contained"
          color="primary"
          size="large"
          onClick={onRevokeApprove}
          disabled={revokeApproveLoading || BigNumber(project?.tokenMetadata?.allowance).eq(BigNumber(0))}
          className={classes.button}
        >
          <Typography variant="h5">{revokeApproveLoading ? <CircularProgress size={15} /> : `Revoke approve for ${project?.tokenMetadata?.symbol}`}</Typography>
        </Button>
        <Button
          fullWidth
          disableElevation
          variant="contained"
          color="primary"
          size="large"
          onClick={onApprove}
          disabled={
            approveLoading ||
            !amount ||
            amount === '' ||
            isNaN(amount) ||
            BigNumber(amount).eq(BigNumber(0)) ||
            BigNumber(project?.tokenMetadata?.allowance).gte(BigNumber(amount))
          }
          className={classes.button}
        >
          <Typography variant="h5">{approveLoading ? <CircularProgress size={15} /> : `Approve ${project?.tokenMetadata?.symbol}`}</Typography>
        </Button>
        <Button
          fullWidth
          disableElevation
          variant="contained"
          color="primary"
          size="large"
          onClick={onLock}
          disabled={
            lockLoading ||
            !amount ||
            amount === '' ||
            isNaN(amount) ||
            BigNumber(amount).eq(BigNumber(0)) ||
            BigNumber(project?.tokenMetadata?.allowance).lt(BigNumber(amount))
          }
          className={classes.button}
        >
          <Typography variant="h5">{lockLoading ? <CircularProgress size={15} /> : `Lock ${project?.tokenMetadata?.symbol}`}</Typography>
        </Button>
      </div>
    </Paper>
  );
}
