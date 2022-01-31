import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

import { formatCurrency, formatAddress } from '../../utils';
import { Button, CircularProgress, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import stores from '../../stores';
import { APPLY_BOOST, APPLY_BOOST_RETURNED, ERROR, VOTE_RETURNED } from '../../stores/constants';

function descendingComparator(a, b, orderBy) {
  if (!a || !b) {
    return 0;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'vault', numeric: false, disablePadding: false, label: 'Vault' },
  {
    id: 'totalBalance',
    numeric: true,
    disablePadding: false,
    label: 'Total balance',
  },
  {
    id: 'relativeWeight',
    numeric: true,
    disablePadding: false,
    label: 'Votes',
  },
  {
    id: 'gaugeApr',
    numeric: true,
    disablePadding: false,
    label: 'Average APR',
    tooltip: 'Current Epoch APR -> Next Epoch APR, value is average APR at max boost',
  },
  {
    id: 'balance',
    numeric: true,
    disablePadding: false,
    label: 'My balance',
  },
  {
    id: 'boost',
    numeric: true,
    disablePadding: false,
    label: 'Boost',
  },
  {
    id: 'apr',
    numeric: true,
    disablePadding: false,
    label: 'My APR',
    tooltip: 'Current Epoch APR -> Next Epoch APR',
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={'normal'} sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
              <Typography variant="h5">{headCell.label}</Typography>
              {orderBy === headCell.id ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span> : null}
            </TableSortLabel>
            {headCell.tooltip ? (
              <Tooltip title={headCell.tooltip}>
                <InfoIcon />
              </Tooltip>
            ) : (
              ''
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '12px',
  },
  textSpaced: {
    lineHeight: '1.5',
  },
  textSpacedClickable: {
    lineHeight: '1.5',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  cell: {},
  cellSuccess: {
    color: '#4eaf0a',
  },
  cellAddress: {
    cursor: 'pointer',
  },
  aligntRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  skelly: {
    marginBottom: '12px',
    marginTop: '12px',
  },
  skelly1: {
    marginBottom: '12px',
    marginTop: '24px',
  },
  skelly2: {
    margin: '12px 6px',
  },
  tableBottomSkelly: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cdpActions: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    borderTop: '1px solid rgba(128, 128, 128, 0.25)',
    background: theme.palette.type === 'dark' ? '#22252E' : '#fff',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: 'radial-gradient(circle, rgba(63,94,251,0.7) 0%, rgba(47,128,237,0.7) 48%) rgba(63,94,251,0.7) 100%',
  },
  assetInfoError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: '#dc3545',
  },
  infoField: {
    flex: 1,
  },
  flexy: {
    padding: '6px 0px',
  },
  overrideCell: {
    padding: '0px',
  },
  hoverRow: {
    cursor: 'pointer',
  },
  statusLiquid: {
    color: '#dc3545',
  },
  statusWarning: {
    color: '#FF9029',
  },
  statusSafe: {
    color: 'green',
  },
}));

export default function EnhancedTable({ project }) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('balance');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(function () {
    const applyBoostReturned = () => {
      setResetLoading(false);
    };

    stores.emitter.on(APPLY_BOOST_RETURNED, applyBoostReturned);
    stores.emitter.on(ERROR, applyBoostReturned);

    return () => {
      stores.emitter.removeListener(APPLY_BOOST_RETURNED, applyBoostReturned);
      stores.emitter.removeListener(ERROR, applyBoostReturned);
    };
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const onApplyBoost = (gauge) => {
    setResetLoading(true);

    stores.dispatcher.dispatch({ type: APPLY_BOOST, content: { project: project, gaugeAddress: gauge.address } });
  };

  if (!project || !project.gauges) {
    return (
      <div className={classes.root}>
        <Skeleton variant="rect" width={'100%'} height={40} className={classes.skelly1} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
      </div>
    );
  }

  function displayBoost(gauge) {
    if (gauge.appliedBoost === 2.5 || isNaN(gauge.appliedBoost)) {
      return (
        <Typography variant="h5" className={classes.textSpaced}>
          {formatCurrency(gauge.appliedBoost)}x
        </Typography>
      );
    }

    return (
      <Tooltip title={`You need ${formatCurrency(gauge.needVeHndForMaxBoost)} more veHND to get max boost`} followCursor>
        <Typography variant="h5" className={classes.textSpacedClickable}>
          {formatCurrency(gauge.appliedBoost)}x
        </Typography>
      </Tooltip>
    );
  }

  function displayApplyBoost(gauge) {
    if (gauge.boost - gauge.appliedBoost > 0.01) {
      return (
        <Tooltip title={`Your effective boost is ${formatCurrency(gauge.boost)} click on apply if you wish to update it`} followCursor>
          <Button
            disableElevation
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              onApplyBoost(gauge);
            }}
            disabled={resetLoading}
          >
            <Typography variant="h5">{resetLoading ? <CircularProgress size={15} /> : 'Apply'}</Typography>
          </Button>
        </Tooltip>
      );
    }
  }

  function displayStakeAtMaxBoost(gauge) {
    return (
      <Tooltip title={`You can stake ${formatCurrency(gauge.remainingBalance)} ${gauge.lpToken.underlyingSymbol} more at max boost`} followCursor>
        <Typography variant="h5" className={classes.textSpacedClickable}>
          {formatCurrency(gauge.balance)}
        </Typography>
      </Tooltip>
    );
  }

  return (
    <div className={classes.root}>
      <TableContainer>
        <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
          <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={project?.gauges.length} />
          <TableBody>
            {stableSort(project?.gauges, getComparator(order, orderBy)).map((row, index) => {
              if (!row) {
                return null;
              }
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow key={labelId}>
                  <TableCell className={classes.cell}>
                    <Typography variant="h5" className={classes.textSpaced}>
                      {row.lpToken.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h5" className={classes.textSpaced}>
                      {formatCurrency(row.totalStakeBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h5" className={classes.textSpaced}>
                      {formatCurrency(row.weight)}
                    </Typography>
                  </TableCell>

                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h5" className={classes.textSpaced}>
                      {formatCurrency(row.nextEpochGaugeApr) == 0.0
                        ? formatCurrency(row.gaugeApr) + '% -> Pending'
                        : formatCurrency(row.gaugeApr) + '% ->' + formatCurrency(row.nextEpochGaugeApr) + '%'}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {row.remainingBalance > 0 ? (
                      displayStakeAtMaxBoost(row)
                    ) : (
                      <Typography variant="h5" className={classes.textSpaced}>
                        {formatCurrency(row.balance)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {displayBoost(row)}
                    {displayApplyBoost(row)}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h5" className={classes.textSpaced}>
                      {formatCurrency(row.nextEpochApr) == 0.0
                        ? formatCurrency(row.apr) + '% -> Pending'
                        : formatCurrency(row.apr) + '% ->' + formatCurrency(row.nextEpochApr) + '%'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
