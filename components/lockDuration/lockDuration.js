  
import React, { useState, useEffect } from 'react';
// import stores from '../../stores/index.js';
// import classes from './veAssetGeneration.module.css';

import { ethers, BigNumber } from "ethers";
import GaugeChart from "react-gauge-chart";
import styled from "styled-components";
import Skeleton from "@material-ui/lab/Skeleton";

// import { UseDillOutput } from "../../../containers/Dill";
// import { accentColor } from "../../../util/constants";

const formatNumber = (number) => Math.round(parseFloat(ethers.utils.formatEther(number))).toLocaleString();
function toFixedIfNecessary( value, dp ){
  return +parseFloat(value).toFixed( dp );
}
function LockDurationChart ({ project }) {

  const accentColor = "#26ff91";
  const ChartContainer = styled.div`
    margin-top: 18px;
    text {
      font-size: 24px !important;
    }
  `;
  
  // const [project, setProject] = useState(null);
  // const updateProject = () => {
  //   setProject(props.project);
  // };
  // useEffect(updateProject, [props]);

  let totalSupply = project?.veTokenMetadata.totalSupply;
  let totalLocked = project?.veTokenMetadata.supply;

    // const { totalSupply: dillSupply, totalLocked: pickleLocked } = dillStats;
  
    if (!totalSupply || !totalLocked) {
      return (
        <Skeleton
          variant="rect"
          animation="wave"
          width="100%"
          height="250px"
          style={{
            backgroundColor: "#FFF",
            opacity: 0.1,
          }}
        />
      );
    }
  
    const ratio = totalSupply / totalLocked;
      // parseFloat(ethers.utils.formatEther(totalLocked)) /
      // parseFloat(ethers.utils.formatEther(totalLocked));
    const years = Math.round(ratio * project.maxDurationYears * 100) / 100;
  
    return (
      <>
        <ChartContainer>
          <GaugeChart
            id="lock-duration-gauge-chart"
            nrOfLevels={project.maxDurationYears}
            colors={["#FFF", accentColor]}
            arcWidth={0.2}
            needleColor={accentColor}
            needleBaseColor={accentColor}
            percent={ratio}
            formatTextValue={() => `${years} years`}
          />

        <div>
          The average lock duration is currently{" "}
          <span style={{ color: accentColor }}>{years}</span> years (based on{" "}
          {toFixedIfNecessary(totalSupply,2)} {project.veTokenMetadata.symbol} and {toFixedIfNecessary(totalLocked,2)} {project.tokenMetadata.symbol} 
            locked).
        </div>
        </ChartContainer>
  
      </>
    );
  };

export default LockDurationChart;
