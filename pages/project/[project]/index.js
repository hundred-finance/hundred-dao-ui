import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Typography, Paper } from '@material-ui/core';

import Layout from '../../../components/layout/layout.js';
import Balances from '../../../components/balances';
import LockDurationChart from '../../../components/lockDuration';

import VeAssetGeneration from '../../../components/veAssetGeneration';
import VeAssetModificationAmount from '../../../components/veAssetModificationAmount';
import VeAssetModificationDuration from '../../../components/veAssetModificationDuration';
import GaugeVoting from '../../../components/gaugeVoting';
import BoostCalculator from '../../../components/boostCalculator';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

import classes from './project.module.css';

import stores from '../../../stores/index.js';
import {
  GET_PROJECT,
  PROJECT_RETURNED,
  GAUGES_CONFIGURED,
  GET_TOKEN_BALANCES,
  TOKEN_BALANCES_RETURNED,
  CONFIGURE_RETURNED,
  CONNECT_WALLET, CONFIGURE_GAUGES,
} from '../../../stores/constants';

import PieChart from '../../../components/gaugeVoting/pieChart';
import GaugeVotesTable from '../../../components/gaugeVoting/gaugeVotesTable';
import BigNumber from 'bignumber.js';

function Projects({ changeTheme }) {
  const router = useRouter();

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(function () {
    const projectReturned = (proj) => {
      setProject(proj);
      if (proj?.onload) {
        proj.onload();
      }
      forceUpdate();
    }

    const accountConfigured = () => {
      setAccount(stores.accountStore.getStore('account'))
    }

    stores.emitter.on(PROJECT_RETURNED, projectReturned);
    stores.emitter.on(TOKEN_BALANCES_RETURNED, projectReturned)
    stores.emitter.on(CONFIGURE_RETURNED, accountConfigured)

    setAccount(stores.accountStore.getStore('account'))

    if(router.query.project) {
      stores.dispatcher.dispatch({ type: GET_PROJECT, content: { id: router.query.project } });
      stores.dispatcher.dispatch({ type: GET_TOKEN_BALANCES, content: { id: router.query.project } });
      stores.dispatcher.dispatch({ type: CONFIGURE_GAUGES });
    } else {
      router.push("/")
    }

    return () => {
      stores.emitter.removeListener(PROJECT_RETURNED, projectReturned);
      stores.emitter.removeListener(TOKEN_BALANCES_RETURNED, projectReturned)
      stores.emitter.removeListener(CONFIGURE_RETURNED, accountConfigured)
    };
  }, []);

  useEffect(
    function () {
      const gaugesReturned = (projs) => {
        stores.dispatcher.dispatch({ type: GET_PROJECT, content: { id: router.query.project } });
        stores.dispatcher.dispatch({ type: GET_TOKEN_BALANCES, content: { id: router.query.project } });
      };

      stores.emitter.on(GAUGES_CONFIGURED, gaugesReturned);

      return () => {
        stores.emitter.removeListener(GAUGES_CONFIGURED, gaugesReturned);
      };
    },
    [router],
  );

  const backClicked = () => {
    router.push('/');
  };

  const callConnect = () => {
    stores.emitter.emit(CONNECT_WALLET)
  }

  return (
    <Layout changeTheme={changeTheme} backClicked={backClicked}>
      <Header changeTheme={changeTheme} backClicked={backClicked} />

        <div className={classes.projectContainer}>

          <Balances project={project} />

          <div className={classes.projectCardContainer2EqualColumns}>
            <Paper elevation={1} className={classes.ChartContainer}>
              <Typography variant="h3">
                Current Vote weighting
              </Typography>
              <PieChart
                data={project?.gauges?.sort((a, b) => (a.currentEpochRelativeWeight > b.currentEpochRelativeWeight ? -1 : 1))}
                dataKey={"currentEpochRelativeWeight"}
              />
            </Paper>
            <Paper elevation={1} className={classes.ChartContainer}>
              <Typography variant="h3">
                Next epoch Vote weighting
              </Typography>
              <PieChart
                data={project?.gauges?.sort((a, b) => (a.nextEpochRelativeWeight > b.nextEpochRelativeWeight ? -1 : 1))}
                dataKey={"nextEpochRelativeWeight"}
              />
            </Paper>
          </div>

          {isLockIncreasePossible(project) ?
            <div className={classes.projectCardContainer}>
              <VeAssetModificationAmount project={project} />
              <VeAssetModificationDuration project={project} />
              <LockDurationChart project={project} />
            </div>
            :
            <div className={classes.projectCardContainer2Columns}>
              <VeAssetGeneration project={project} />
              <LockDurationChart project={project} />
            </div>
          }

          <div className={classes.projectCardContainer2EqualColumns}>
            <GaugeVoting project={project}/>
            <BoostCalculator project={project}/>
          </div>

          <div className={classes.fakeGrid}>
            <Paper elevation={1}>
              <GaugeVotesTable project={project} />
            </Paper>
          </div>

        </div>

      <Footer />
    </Layout>
  );
}

function isLockIncreasePossible(project) {
  return project && project.veTokenMetadata && project.veTokenMetadata.userLocked > 0
}

export default Projects;
