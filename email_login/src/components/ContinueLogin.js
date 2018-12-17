import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './continueLogin.scss';
import './clockLoading.scss';

const { continueLogin } = string;

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
  </div>
);

const renderContent = props => (
  <div className="content">
    <div className="content-header">
      <p>{continueLogin.title}</p>
    </div>
    <div className="message">
      <p>{continueLogin.message}</p>
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
      <p>{continueLogin.getPromptLabel}</p>
      <button
        className="resend-button"
        disabled={props.disabledResendLoginRequest}
        onClick={props.onClickResendLoginRequest}
      >
        <span>
          {props.disabledResendLoginRequest
            ? continueLogin.buttons.sending
            : continueLogin.buttons.resend}
        </span>
      </button>
    </div>
    {!props.hasTwoFactorAuth && (
      <div className="cant-access">
        <span onClick={props.onClickSignInWithPassword}>
          {continueLogin.passwordLoginLabel}
        </span>
      </div>
    )}
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderHeader.propTypes = {
  toggleContinue: PropTypes.func
};

// eslint-disable-next-line fp/no-mutation
renderContent.propTypes = {
  disabledResendLoginRequest: PropTypes.bool,
  hasTwoFactorAuth: PropTypes.bool,
  onClickSignInWithPassword: PropTypes.func,
  onClickResendLoginRequest: PropTypes.func
};

export default ContinueLogin;
