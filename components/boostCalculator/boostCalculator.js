import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  RadioGroup, FormControlLabel, Radio,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import classes from './boostCalculator.module.css';
import moment from 'moment';
import { formatCurrency } from '../../utils';

export default function BoostCalculator({ project }) {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [stakeAmountError, setStakeAmountError] = useState(false);
  const [lockAmount, setLockAmount] = useState(0);
  const [lockAmountError, setLockAmountError] = useState(false);
  const [gauge, setGauge] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');

  const onGaugeSelectChanged = (event, theOption) => {
    setGauge(theOption);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    switch (event.target.value) {
      case 'week':
        setSelectedDate(moment().add(1, 'weeks').format('YYYY-MM-DD'));
        break;
      case 'month':
        setSelectedDate(moment().add(1, 'months').format('YYYY-MM-DD'));
        break;
      case 'year':
        setSelectedDate(moment().add(1, 'years').format('YYYY-MM-DD'));
        break;
      default:
        setSelectedDate(moment().add(4, 'years').subtract(1, "days").format('YYYY-MM-DD'));
    }
  };

  const calculatedBoost = (project, gauge, stake, lock, endLockDate) => {
    const veHndForLock = veTokenForLock(lock, endLockDate)
    const totalVeTokenSupply = project?.veTokenMetadata.totalSupply;

    return userBoost(gauge, stake, veHndForLock, +totalVeTokenSupply)
  }

   const veTokenForLock = (lock, endLockDate) => {
     const lockDuration = moment.duration(moment(endLockDate).diff(moment())).asDays()
     const maxLockDuration = moment.duration(moment().add(4, 'years').diff(moment())).asDays()

     let amount = lock * lockDuration / maxLockDuration

     return amount ? amount : 0
   }

  const userBoost = (gauge, stake, veTokenBalance, totalVeTokenSupply) => {
    if (!gauge) {
      return 0
    }

    return Math.min(userLiquidityShare(gauge, stake, veTokenBalance, totalVeTokenSupply) /
      userLiquidityShare(gauge, stake, 0, totalVeTokenSupply), 2.5)
  }

  const userLiquidityShare = (gauge, balance, veTokenBalance, totalVeTokenSupply) => {

    let workingBalance = Math.min(
      balance * 0.4 + (gauge.totalStakeBalance + balance) * 0.6 * veTokenBalance / (totalVeTokenSupply + veTokenBalance),
      balance
    )

    let totalWorkingSupply =
      gauge.workingSupply.div(10 ** gauge.lpToken.underlyingDecimals).toNumber() * gauge.lpToken.conversionRate

    return workingBalance * 100 / (totalWorkingSupply + workingBalance);
  }

  const userAPR = (gauge, balance, lock, endLockDate) => {
    const veHndForLock = veTokenForLock(lock, endLockDate)
    const totalVeTokenSupply = project?.veTokenMetadata.totalSupply;
    const liquidityShare = userLiquidityShare(gauge, +balance, +veHndForLock, +totalVeTokenSupply)

    return gauge.gaugeRewards * liquidityShare / (+balance * gauge.lpToken.price)
  }

  return (
    <Paper elevation={1} className={classes.projectCardContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Boost Calculator
      </Typography>
      <div>

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
            getOptionLabel={(option) => option.lpToken.underlyingSymbol}
            fullWidth={true}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <div className={classes.text}>{option.lpToken.underlyingSymbol}</div>
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
                Staked amount { gauge ? `($${formatCurrency(stakeAmount * gauge.lpToken.price)})` : '' }
              </Typography>
            </div>
          </div>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="0.00"
            value={stakeAmount}
            error={stakeAmountError}
            onChange={(e) => {
              setStakeAmount(e.target.value);
            }}
          />
        </div>

        <div className={classes.textField}>
          <div className={classes.inputTitleContainer}>
            <div className={classes.inputTitle}>
              <Typography variant="h5" noWrap>
                Locked HND amount { lockAmount ? `($${formatCurrency(lockAmount * project.hndPrice)})` : '' }
              </Typography>
            </div>
          </div>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="0.00"
            value={lockAmount}
            error={lockAmountError}
            onChange={(e) => {
              setLockAmount(e.target.value);
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
            <FormControlLabel value="week" control={<Radio color="primary" />} label="1 week" labelPlacement="bottom" />
            <FormControlLabel value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="bottom" />
            <FormControlLabel value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="bottom" />
            {project?.maxDurationYears == 3 ?
              <FormControlLabel value="3year" control={<Radio color="primary" />} label="3 years" labelPlacement="bottom" />
              :
              <FormControlLabel value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="bottom" />
            }
          </RadioGroup>
        </div>

        <div className={classes.boost}>
          <div>
            <Typography >
              Estimated veHND: { formatCurrency(veTokenForLock(lockAmount, selectedDate)) }
            </Typography>
            <Typography >
              Total veHND: { formatCurrency(+project?.veTokenMetadata.totalSupply) }
            </Typography>
            { gauge ?
              <Typography>
                Total { gauge.lpToken.underlyingSymbol } staked in gauge: { formatCurrency(gauge.totalStakeBalance) }
              </Typography>
              : ''
            }
          </div>
          <div>
            <Typography variant="h3">
              Estimated boost: { formatCurrency(calculatedBoost(project, gauge, stakeAmount, lockAmount, selectedDate)) }
            </Typography>
            { gauge ?
              <Typography>
                Estimated APR: { formatCurrency(userAPR(gauge, stakeAmount, lockAmount, selectedDate)) }%
              </Typography>
              : ''
            }
          </div>
        </div>

      </div>
    </Paper>
  );
}