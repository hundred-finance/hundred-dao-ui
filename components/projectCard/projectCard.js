import React from 'react';
import { Typography, Paper, Grid } from '@material-ui/core';
import { useRouter } from 'next/router';

import classes from './projectCard.module.css';
import stores from '../../stores/index.js';

import { CONNECT_WALLET } from '../../stores/constants';
import { NETWORKS_CONFIG } from '../../stores/connectors';

export default function ProjectCard({ project }) {
  const router = useRouter();

  const handleNavigate = async () => {
    if (!stores.accountStore.store.account || !stores.accountStore.store.account.address) {
      return callConnect();
    }

    if (stores.accountStore.store.account.chainId !== project.chainId) {
      const provider = await stores.accountStore.getWeb3Provider();
      const targetNetwork = NETWORKS_CONFIG.find((n) => parseInt(n.chainId) === project.chainId);
      if (project.chainId === 1) {
        await provider.currentProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });
      } else if (project.chainId === 42) {
        await provider.currentProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2A' }] });
      } else {
        await provider.currentProvider.request({ method: 'wallet_addEthereumChain', params: [targetNetwork] });
      }
      return;
    }

    await router.push(`/project/${project.id}`);
  };

  const callConnect = () => {
    stores.emitter.emit(CONNECT_WALLET);
  };

  return (
    <Paper elevation={1} className={classes.projectCardContainer} onClick={handleNavigate}>
      <div className={classes.projectCardTitle}>
        <div className={classes.projectCardLogo}>
          <img src={project.logo ? project.logo : '/unknown-logo.png'} alt="" height={70} />
        </div>
        <div className={classes.projectCardName}>
          <Typography variant="h2" className={classes.fontWeightBold}>
            {project.name}
          </Typography>
          <Typography variant="h5" className={classes.fontWeightBold}>
            {project.url}
          </Typography>
        </div>
      </div>
    </Paper>
  );
}
