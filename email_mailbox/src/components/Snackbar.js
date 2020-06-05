import React from 'react';
import PropTypes from 'prop-types';
import './snackbar.scss';

const Loading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

const Snackbar = props => (
  <div className="snackbar-wrapper">
    <ProgressIndicator {...props} />
    <div className="snackbar-message-contianer">
      <div className="snackbar-message">
        <span>{props.message}</span>
      </div>
      <div className="snackbar-account">
        <span>{props.email}</span>
      </div>
    </div>
    {props.progress < 100 && (
      <div className="snackbar-close" onClick={props.onDismissSnackbar}>
        <i className="icon-exit" />
      </div>
    )}
  </div>
);

const ProgressIndicator = props => {
  switch (props.progress) {
    case -2:
      return (
        <div className="snackbar-loader-container">
          <div className="snackbar-failure-progress">
            <i className="icon-exit" />
          </div>
        </div>
      );
    case -1:
      return (
        <div className="snackbar-loader-container">
          <Loading />
        </div>
      );
    case 100:
      return (
        <div className="snackbar-loader-container">
          <div className="snackbar-success-progress">
            <i className="icon-check" />
          </div>
        </div>
      );
    default:
      return (
        <div className="snackbar-loader-container">
          <Loading />
          <span>{props.progress}%</span>
        </div>
      );
  }
};

Snackbar.propTypes = {
  email: PropTypes.string,
  message: PropTypes.string,
  progress: PropTypes.number,
  onDismissSnackbar: PropTypes.func
};

ProgressIndicator.propTypes = {
  progress: PropTypes.number
};

export default Snackbar;
