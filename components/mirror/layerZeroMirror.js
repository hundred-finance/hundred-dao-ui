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

  const onMirror = () => {
    stores.dispatcher.dispatch({ type: MIRROR_LOCK, content: { project: project, target: targetChain.layerZero } });
  };

  return (
    <Paper elevation={1} className={classes.overviewContainer}>
      <Typography variant="h3" className={classes.sectionHeader}>
        Mirror lock to a target chain
      </Typography>
      <Typography variant="h5" className={classes.sectionsubHeader}>
        powered by LayerZero
      </Typography>
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
          options={project.targetChainMirrorGates}
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
          Mirror {formatCurrency(project.veTokenMetadata.localBalance)} veHND
        </Button>
      </div>
      {project?.mirrored_locks?.length > 0 ? (
        <div className={classes.overviewCard}>
          <Typography variant="h3" className={classes.subsectionHeader}>
            Mirrored locks from other chains:
          </Typography>
          <div className={classes.locksTable}>
            {project?.mirrored_locks?.map((lock, idx) => {
              return (
                <div className={classes.lock_line} key={'lock' + idx}>
                  <Typography variant="h5">{lock.amount} veHND</Typography>
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
    </Paper>
  );
}
