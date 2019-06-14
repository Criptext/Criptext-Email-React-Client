import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './signintoapprove.scss';
import './clockLoading.scss';

const { signInToApprove } = string;

const SignInToApprove = props => (
  <div id="section-signintoapprove">{renderContent(props)}</div>
);

const renderContent = props => (
  <div className="content">
    <div className="content-header">
      <p>{signInToApprove.title}</p>
    </div>
    <div className="message">
      <p>{signInToApprove.message}</p>
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
      <p>{signInToApprove.getPromptLabel}</p>
      <button
        className="resend-button"
        disabled={props.disabledResendLoginRequest}
        onClick={props.onClickResendLoginRequest}
      >
        <span>
          {props.disabledResendLoginRequest
            ? signInToApprove.buttons.sending
            : signInToApprove.buttons.resend}
        </span>
      </button>
    </div>
    {!props.hasTwoFactorAuth && (
      <div className="cant-access">
        <span onClick={props.onClickSignInWithPassword}>
          {signInToApprove.passwordLoginLabel}
        </span>
      </div>
    )}
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderContent.propTypes = {
  disabledResendLoginRequest: PropTypes.bool,
  hasTwoFactorAuth: PropTypes.bool,
  onClickSignInWithPassword: PropTypes.func,
  onClickResendLoginRequest: PropTypes.func
};

export default SignInToApprove;
