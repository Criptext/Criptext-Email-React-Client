import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './loadingsync.scss';

const LoadingSync = props => (
  <div className="cptx-loading-sync-container">
    <div className="cptx-loading-background">
      <div
        className="cptx-loading-progress"
        style={{
          width: `${calculateProgress(props.totalTask, props.completedTask)}%`
        }}
      />
    </div>
    <div className="cptx-loading-description">
      <span>{`${props.completedTask} ${string.mailbox.of} ${
        props.totalTask
      }`}</span>
    </div>
  </div>
);

const calculateProgress = (totalTask, completedTask) => {
  if (totalTask === 0 && completedTask) return 0;
  return (completedTask / totalTask) * 100;
};

LoadingSync.propTypes = {
  completedTask: PropTypes.number,
  totalTask: PropTypes.number
};

export default LoadingSync;
