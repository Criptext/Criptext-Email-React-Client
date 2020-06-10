import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './loading.scss';

// const messages = string.loading.messages;
export const statusType = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation',
  COMPLETE: 'complete-animation',
  ACTIVE: 'active-animation'
};

const errorType = {
  MX_NOT_MATCH: 1,
  OTHER: 2
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
        <br />
        <div className="dialog-button">{dialogButton(props)}</div>
      </div>
    </div>
  </div>
);

export const SingleLoading = props => (
  <div id={'loading-container'} className="dialog-container">
    <div className="dialog-content">
      <div className="dialog-content-body">
        <div className="bar">
          <div
            className={`content ${props.animationClass}`}
            style={{ width: props.percent + '%' }}
          />
        </div>
      </div>
    </div>
  </div>
);

const dialogTitle = props => {
  if (props.animationClass === statusType.RUNNING) {
    return <p> {string.address.add.step3.running.title}</p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === errorType.MX_NOT_MATCH
  ) {
    return <p> {string.address.add.step3.error1.title} </p>;
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === errorType.OTHER
  ) {
    return <p> {string.address.add.step3.error3.title} </p>;
  } else if (props.animationClass === statusType.COMPLETE) {
    return <p> {string.address.add.step3.complete.title}</p>;
  }
};

const dialogText = props => {
  if (props.animationClass === statusType.RUNNING) {
    const theExtraS = props.minutes <= 1 ? '' : 's';
    return (
      <p className="dialog-gray">
        {' '}
        {string.address.add.step3.running.timer.first} {props.minutes}{' '}
        {string.address.add.step3.running.timer.second}
        {theExtraS} {string.address.add.step3.running.timer.third}
      </p>
    );
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === errorType.MX_NOT_MATCH
  ) {
    return (
      <p>
        {props.domain} {string.address.add.step3.error2.text_1}{' '}
        <a
          href="https://www.criptext.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          {string.address.add.need_help}
        </a>
        <br />
        <br />
        {string.address.add.step3.error2.text_2}
      </p>
    );
  } else if (
    props.animationClass === statusType.STOP &&
    props.errorType === errorType.OTHER
  ) {
    return (
      <p>
        {' '}
        {string.address.add.step3.error3.text}{' '}
        <a
          href="https://www.criptext.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          {string.address.add.need_help}
        </a>{' '}
      </p>
    );
  } else if (props.animationClass === statusType.COMPLETE) {
    return (
      <p className="dialog-gray"> {string.address.add.step3.complete.text} </p>
    );
  }
};

const dialogButton = props => {
  if (props.animationClass === statusType.RUNNING) {
    return (
      <button className="loading-button" disabled>
        {renderLoading()}
      </button>
    );
  } else if (props.animationClass === statusType.STOP) {
    return (
      <button className="back-button" onClick={() => props.decreaseStep()}>
        {string.address.add.backButtonLabel}
      </button>
    );
  }
  return '';
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
  domain: PropTypes.string,
  percent: PropTypes.number,
  failed: PropTypes.bool,
  errorType: PropTypes.number,
  minutes: PropTypes.number,
  restart: PropTypes.func,
  decreaseStep: PropTypes.func
};

SingleLoading.propTypes = {
  animationClass: PropTypes.string,
  percent: PropTypes.number
};

export default Loading;
