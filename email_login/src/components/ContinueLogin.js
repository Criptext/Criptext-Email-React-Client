import React from 'react';
import PropTypes from 'prop-types';
import './continueLogin.css';

const ContinueLogin = props => (
  <div className="continue">
    {renderHeader(props)}
    {renderContent(props)}
  </div>
);

const renderHeader = props => (
  <div className="header">
    <div className="button-section">
      <button className="back-button" onClick={ev => props.toggleContinue(ev)}>
        <i className="icon-back" />
      </button>
    </div>
    <div className="criptext-logo">
      <div className="icon" />
    </div>
    <div className="header-clear" />
  </div>
);

const renderContent = props => (
  <div className="content">
    <div className="content-header">
      <p>Log In</p>
    </div>
    <div className="message">
      <p>Check and approve on your existing</p>
      <p>Criptext device to continue.</p>
    </div>
    <div className="loading">
      <div className="icon-clock" />
      <div className="loader">
        <div className="loader-arrow" />
      </div>
      <div className="sk-fading-circle">
        <div className="sk-circle1 sk-circle" />
        <div className="sk-circle2 sk-circle" />
        <div className="sk-circle3 sk-circle" />
        <div className="sk-circle4 sk-circle" />
        <div className="sk-circle5 sk-circle" />
        <div className="sk-circle6 sk-circle" />
        <div className="sk-circle7 sk-circle" />
        <div className="sk-circle8 sk-circle" />
        <div className="sk-circle9 sk-circle" />
        <div className="sk-circle10 sk-circle" />
        <div className="sk-circle11 sk-circle" />
        <div className="sk-circle12 sk-circle" />
      </div>
    </div>
    <div className="button">
      <p>Didn&#39;t get the prompt?</p>
      <button className="resend-button">
        <span>Resend it</span>
      </button>
    </div>
    <div className="cant-access">
      <span onClick={ev => props.handleLostDevices(ev)}>
        Can&#39;t access to your device?
      </span>
    </div>
  </div>
);

renderHeader.propTypes = {
  toggleContinue: PropTypes.func
};

renderContent.propTypes = {
  handleLostDevices: PropTypes.func
};

export default ContinueLogin;
