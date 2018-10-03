import React from 'react';
import PropTypes from 'prop-types';
import './loading.css';

const LinkingDevices = props => (
  <div className="loading-body">
    <div className="content">
      <div className="logo">
        <span className="icon-criptext" />
      </div>
      {renderBar()}
      <div className="percent">
        <div className="content">
          <span className="number">{props.percent}%</span>
        </div>
      </div>
      <div className="message">{renderMessage(props)}</div>
    </div>
  </div>
);

const renderBar = () => (
  <div className="bar">
    <div className={`content`} style={{ width: '50%' }} />
  </div>
);

const renderMessage = props => {
  if (props.failed === true) {
    return (
      <div className="retry">
        <span>Error generating the keys. </span>
        <span className="retry-link" onClick={() => props.restart()}>
          Retry
        </span>
      </div>
    );
  }
  return <span className="creating"> {props.message}</span>;
};

LinkingDevices.propTypes = {
  animationClass: PropTypes.string,
  percent: PropTypes.number
};

renderMessage.propTypes = {
  failed: PropTypes.boolean,
  message: PropTypes.string,
  restart: PropTypes.func
};

export default LinkingDevices;
