import React, { useEffect, useState } from 'react';
import { Button, Paper, TextField, Typography } from '@material-ui/core';
import classes from './layerzero-mirror.module.css';
import stores from '../../stores';
import { MIRROR_LOCK } from '../../stores/constants';
import { formatCurrency } from '../../utils';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function LayerZeroMirror({ project }) {
  const [targetChain, setTargetChain] = useState(undefined);

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

    if (project.multichain) {
      let multiChain = project.targetChainMirrorGates
        .filter((t) => t.hasActiveMveHND && t.multichain !== undefined)
        .filter((t) => t.chainId !== 1666600000 || project.multichain.mirrorGateV2 !== undefined);

      for (let t = 0; t < multiChain.length; t++) {
        if (targets.find((tt) => tt.chainId === multiChain[t].chainId) === undefined) {
          targets.push(multiChain[t]);
        }
      }
    }

    return targets;
  };

  const onMirror = () => {
    stores.dispatcher.dispatch({ type: MIRROR_LOCK, content: { project: project, target: targetChain } });
  };

  return (
    <Paper elevation={1} className={classes.overviewContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Mirror lock to a target chain
      </Typography>
      {project.layerZero || project.multichain ? (
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
              options={buildTargetChainsList(project)}
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
              disabled={targetChain === undefined || +project?.veTokenMetadata?.localBalance === 0}
            >
              Mirror {formatCurrency(project.veTokenMetadata.localBalance)} mveHND
            </Button>
          </div>
        </>
      ) : (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Mirroring not supported yet from {project.name}
          </Typography>
        </div>
      )}

      {project?.mirrored_locks?.length > 0 ? (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Mirrored locks from other chains:
          </Typography>
          <div className={classes.locksTable}>
            {project?.mirrored_locks?.map((lock, idx) => {
              return (
                <div className={classes.lock_line} key={'lock' + idx}>
                  <Typography variant="h5">{lock.amount} mveHND</Typography>
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
      {project?.locks_being_mirrored?.length > 0 ? (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Lock mirrors waiting for bridging:
          </Typography>
          <div className={classes.locksTable}>
            {project?.locks_being_mirrored?.map((lock, idx) => {
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
