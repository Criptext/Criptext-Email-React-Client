import React from 'react';
import PropTypes from 'prop-types';
import './continueLogin.scss';
import './clockLoading.scss';

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
      <p>Sign In</p>
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

      <div className="roller">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
    <div className="button">
      <p>Didn&#39;t get the prompt?</p>
      <button
        className="resend-button"
        disabled={props.disabledResendLoginRequest}
        onClick={props.onClickResendLoginRequest}
      >
        <span>
          {props.disabledResendLoginRequest ? 'Sending...' : 'Resend it '}
        </span>
      </button>
    </div>
    <div className="cant-access">
      <span onClick={ev => props.onClickSignInWithPassword(ev)}>
        Sign In with password
      </span>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderHeader.propTypes = {
  toggleContinue: PropTypes.func
};

// eslint-disable-next-line fp/no-mutation
renderContent.propTypes = {
  disabledResendLoginRequest: PropTypes.bool,
  onClickSignInWithPassword: PropTypes.func,
  onClickResendLoginRequest: PropTypes.func
};

export default ContinueLogin;
