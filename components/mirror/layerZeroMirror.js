import React, { useEffect, useState } from 'react';
import { Button, Paper, TextField, Typography } from '@material-ui/core';
import classes from './layerzero-mirror.module.css';
import stores from '../../stores';
import { MIRROR_LOCK, TOKEN_BALANCES_RETURNED } from '../../stores/constants';
import { formatCurrency } from '../../utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { BigNumber, ethers } from 'ethers';

export default function LayerZeroMirror({ project }) {
  const [targetChain, setTargetChain] = useState(undefined);
  const [localProject, setLocalProject] = useState(project);

  useEffect(function () {
    const updateProject = () => {
      setLocalProject(project);
      console.log('update project to', project);
    };

    stores.emitter.on(TOKEN_BALANCES_RETURNED, updateProject);

    return () => {
      stores.emitter.removeListener(TOKEN_BALANCES_RETURNED, updateProject);
    };
  }, []);

  const onTargetSelectChanged = (event, option) => {
    setTargetChain(option);
  };

  const buildTargetChainsList = (project) => {
    let targets = [];

    if (!project.targetChainMirrorGates) {
      return [];
    }

    if (project.layerZero) {
      targets = [...project.targetChainMirrorGates.filter((t) => t.hasActiveMveHND && t.layerZero !== undefined)];
    }

    if (project.multichain && project.multichain.mirrorGateV3) {
      let multiChain = project.targetChainMirrorGates.filter((t) => t.hasActiveMveHND && t.multichain !== undefined);

      for (let t = 0; t < multiChain.length; t++) {
        if (targets.find((tt) => tt.chainId === multiChain[t].chainId) === undefined) {
          targets.push(multiChain[t]);
        }
      }
    }

    return targets;
  };

  const onMirror = () => {
    stores.dispatcher.dispatch({ type: MIRROR_LOCK, content: { project: localProject, target: targetChain } });
  };

  const aggregatedMveHndBalance = (project, target) => {
    const locks = project.mirrored_locks?.filter((l) => l.chainId !== target?.chainId);

    if (locks === undefined || locks.length === 0) {
      return BigNumber.from(0);
    }

    return (+ethers.utils.formatEther(locks.map((l) => l.amount).reduce((a, b) => a.add(b)))).toFixed(2);
  };

  return (
    <Paper elevation={1} className={classes.overviewContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Mirror lock to a target chain
      </Typography>
      {localProject.layerZero || localProject.multichain ? (
        <>
          <div className={classes.overviewCard}>
            <div className={classes.inputTitleContainer}>
              <div className={classes.inputTitle}>
                <Typography variant="h5" noWrap>
                  Select supported chain
                </Typography>
              </div>
            </div>
            <Autocomplete
              disableClearable={true}
              options={buildTargetChainsList(localProject)}
              value={targetChain}
              onChange={onTargetSelectChanged}
              getOptionLabel={(option) => option.name}
              fullWidth={true}
              renderOption={(option, { selected }) => (
                <React.Fragment>
                  <div className={classes.text}>{option.name}</div>
                </React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    ...{
                      placeholder: 'Search target chain',
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </div>
          <div className={classes.overviewCard}>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              color="primary"
              size="large"
              onClick={onMirror}
              disabled={targetChain === undefined || +aggregatedMveHndBalance(localProject, targetChain) === 0}
            >
              Mirror {formatCurrency(aggregatedMveHndBalance(localProject, targetChain))} mveHND
            </Button>
          </div>
        </>
      ) : (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Mirroring not supported yet from {localProject.name}
          </Typography>
        </div>
      )}

      {localProject?.mirrored_locks?.length > 0 ? (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Mirrored locks from other chains:
          </Typography>
          <div className={classes.locksTable}>
            {localProject?.mirrored_locks?.map((lock, idx) => {
              return (
                <div className={classes.lock_line} key={'lock' + idx}>
                  <Typography variant="h5">{(+ethers.utils.formatEther(lock.amount)).toFixed(2)} mveHND</Typography>
                  <Typography variant="h5" className={classes.lockChainName}>
                    {lock.chain}
                  </Typography>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            No mirrored locks yet
          </Typography>
        </div>
      )}
      {localProject?.locks_being_mirrored?.length > 0 ? (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Lock mirrors waiting for bridging:
          </Typography>
          <div className={classes.locksTable}>
            {localProject?.locks_being_mirrored?.map((lock, idx) => {
              return (
                <div className={classes.lock_line} key={'lock-in-progress' + idx}>
                  <Typography variant="h5">from {lock.source.name}</Typography>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        ''
      )}
    </Paper>
  );
}
