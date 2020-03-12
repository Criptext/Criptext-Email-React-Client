import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './loading.scss';

// const messages = string.loading.messages;
const statusType = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation',
  COMPLETE: 'complete-animation'
};

const Loading = props => (
  <div id={'loading-container'} className="dialog-container">
    <div className="dialog-content">
      <div className="dialog-title">{dialogTitle(props)}</div>
      <div className="dialog-content-body">
        <div className="bar">
          <div
            className={`content ${props.animationClass}`}
            style={{ width: props.percent + '%' }}
          />
        </div>
        <div className="dialog-text">{dialogText(props)}</div>
        <div className="dialog-button">{dialogButton(props)}</div>
        {/*         <div className="percent">
          <div className="content">
            <span className="number">{props.percent}%</span>
          </div>
        </div> */}
      </div>
    </div>
  </div>
);

const dialogTitle = props => {
  if (props.animationClass === statusType.RUNNING) {
    return <p> Verifying Domain Ownership</p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 1
  ) {
    return <p> MX records don’t match </p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 2
  ) {
    return <p> DNS records for this domain were not found </p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 3
  ) {
    return <p> Something Went Wrong </p>;
  } else if (props.animationClass === statusType.COMPLETE) {
    return <p> Your Domain Was Verified Succesfully </p>;
  }
};

const dialogText = props => {
  if (props.animationClass === statusType.RUNNING) {
    return <p className="dialog-gray"> About 10 minutes left</p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 1
  ) {
    return (
      <p>
        {' '}
        Go back and verify that you've added the right information into your{' '}
        <b>DNS records</b>.{' '}
      </p>
    );
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 2
  ) {
    return (
      <p>
        {' '}
        liknaru.com is listed as your domain, make sure this is right; otherwise
        correct the domain on your Company Profile. Need help? <br />
        <br />
        Also check that the DNS records on your domain are not empty; otherwise
        go back and add them from the previous steps.{' '}
      </p>
    );
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === 3
  ) {
    return <p> Try again in a couple of minutes. Need help? </p>;
  } else if (props.animationClass === statusType.COMPLETE) {
    return <p className="dialog-gray"> Done! </p>;
  }
};

const dialogButton = props => {
  if (props.animationClass === statusType.RUNNING) {
    return (
      <button className="loading-button" disabled>
        {renderLoading()}
      </button>
    );
  } else {
    return (
      <button
        className="loading-button"
        onClick={() => props.onClickMinusStep()}
      >
        Back
      </button>
    );
  }
};

const renderLoading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

Loading.propTypes = {
  animationClass: PropTypes.string,
  percent: PropTypes.number
};

export default Loading;
