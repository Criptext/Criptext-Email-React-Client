import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './loading.scss';

const messages = string.loading.messages;

const Loading = props => (
  <div className="loading-body">
    <div className="content">
      <div className="logo">
        <span className="icon-criptext" />
      </div>
      <div className="bar">
        <div
          className={`content ${props.animationClass}`}
          style={{ width: props.percent + '%' }}
        />
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
  if (props.failed) {
    return (
      <div className="retry">
        <span>{messages.error} </span>
        <span className="retry-link" onClick={() => props.restart()}>
          {messages.retry}
        </span>
      </div>
    );
  }
  return <span className="creating"> {messages.creatingKeys} </span>;
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
