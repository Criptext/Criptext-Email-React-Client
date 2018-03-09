import React from 'react';
import PropTypes from 'prop-types';
import './loading.css';

const Loading = props => (
  <div className="loading-body">
    <div className="content">
      <div className="logo">
        <div className="icon" />
      </div>
      <div className="bar">
        <div className={'content ' + props.animationClass} />
      </div>
      <div className="percent">
        <div className="content">
          <span className="number">{props.percent}%</span>
        </div>
      </div>
      <div className="message">{renderMessage(props)}</div>
    </div>
  </div>
);

const renderMessage = props => {
  if (props.failed === true) {
    return (
      <div className="retry">
        <span>Error generating the keys. </span>
        <span className="retry-link" onClick={() => props.restart()}>
          Retry
        </span>?
      </div>
    );
  }
  return <span className="creating"> Creating Keys </span>;
};

Loading.propTypes = {
  animationClass: PropTypes.string,
  percent: PropTypes.number
};

renderMessage.propTypes = {
  failed: PropTypes.boolean,
  restart: PropTypes.func
};

export default Loading;
