import React, { useEffect, useState } from 'react';
import { Button, Paper, Typography } from '@material-ui/core';
import classes from './mirror.module.css';
import stores from '../../stores';
import { MIRROR_LOCKS, MIRRORS_UPDATED } from '../../stores/constants';
import { NETWORKS_CONFIG } from '../../stores/connectors';
import { formatEther } from 'ethers/lib/utils';
import moment from 'moment';

export default function Mirror({ project }) {
  const [mirrors, setMirrors] = useState([]);

  useEffect(function () {
    const mirrorsUpdated = (mirrors) => {
      setMirrors(mirrors);
    };

    stores.emitter.on(MIRRORS_UPDATED, mirrorsUpdated);

    return () => {
      stores.emitter.removeListener(MIRRORS_UPDATED, mirrorsUpdated);
    };
  }, []);

  const chainName = (id) => {
    return NETWORKS_CONFIG.find((c) => parseInt(c.chainId, 16) === parseInt(id)).chainName;
  };

  const calculateVeHndBalance = (lock) => {
    let now = moment().unix();
    let end = lock[3];
    let hndAmount = lock[4];

    if (now > end) {
      return 0;
    }

    return parseFloat((formatEther(hndAmount) * (+end - now)) / (4 * 365 * 24 * 3600)).toFixed(2);
  };

  const displayLock = (mirror) => {
    if (mirror.isMirrored) {
      return '';
    }

    return (
      <Typography variant="h5">
        <div className={classes.lock}>
          {chainName(mirror.lock[1])}: {calculateVeHndBalance(mirror.lock)} veHND
        </div>
      </Typography>
    );
  };

  const onMirror = () => {
    stores.dispatcher.dispatch({ type: MIRROR_LOCKS, project: project });
  };

  if (mirrors.length === 0) {
    return '';
  }

  return (
    <Paper elevation={1} className={classes.overviewContainer}>
      <div>{mirrors.map(displayLock)}</div>
      <div className={classes.separator}></div>
      <div className={classes.overviewCard}>
        <Button fullWidth disableElevation variant="contained" color="primary" size="large" onClick={onMirror} disabled={false}>
          Mirror locks
        </Button>
      </div>
    </Paper>
  );
}
