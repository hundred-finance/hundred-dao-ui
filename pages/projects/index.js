import React, { useState, useEffect } from 'react';

import {
  Typography, Paper, Button, CircularProgress,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { withTheme } from '@material-ui/core/styles';

import Layout from '../../components/layout/layout.js';
import ProjectCard from '../../components/projectCard';
import Header from '../../components/header';

import classes from './projects.module.css';

import stores from '../../stores/index.js';
import {
  ERROR, GET_PROJECTS, PROJECTS_RETURNED, GAUGES_CONFIGURED,
} from '../../stores/constants';

import { formatCurrency, formatAddress } from '../../utils';

function Projects({ changeTheme, theme }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    const projectsReturned = (projs) => {
      setProjects(projs);
      setLoading(false);
    };

    const gaugesReturned = (projs) => {
      stores.dispatcher.dispatch({ type: GET_PROJECTS, content: {} });
    };

    stores.emitter.on(PROJECTS_RETURNED, projectsReturned);
    stores.emitter.on(GAUGES_CONFIGURED, gaugesReturned);

    setLoading(true);
    stores.dispatcher.dispatch({ type: GET_PROJECTS, content: {} });

    return () => {
      stores.emitter.removeListener(PROJECTS_RETURNED, projectsReturned);
      stores.emitter.removeListener(GAUGES_CONFIGURED, gaugesReturned);
    };
  }, []);

  return (
    <Layout changeTheme={changeTheme}>
      <div className={theme.palette.type === 'dark' ? classes.listContainerDark : classes.listContainer}>
        <div className={theme.palette.type === 'dark' ? classes.headerContainerDark : classes.headerContainer}>
          <Header changeTheme={changeTheme} />
        </div>
        {loading && (
          <div className={classes.projectsLoading}>
            <Typography variant="h5" className={classes.projectsLoadingSpace}>
              We are loading the projects
            </Typography>
            <CircularProgress size={15} />
          </div>
        )}
        {!loading && (
          <div className={classes.cardsContainer}>
            {projects && projects.length > 0 && projects.map((project, idx) => <ProjectCard key={idx} project={project} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withTheme(Projects);
