import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from '../utils/const';
import string from '../lang';
import './signinpassword.scss';

const { signInPassword } = string;

const SignInPassword = props => (
  <div id="section-signinpassword">
    {renderSubHeader(props)}
    {renderForm(props)}
  </div>
);

const renderSubHeader = props => (
  <div className="subheader">
    <div className="sub-logo">
      <div className="sub-icon" />
    </div>
    <div className="sub-text">
      {props.hasTwoFactorAuth ? (
        <p>{signInPassword.sectionTitleTwoFactorAuth}</p>
      ) : (
        <p>{signInPassword.sectionTitleSignIn}</p>
      )}
      <p>{defineEmailAddress(props.values.usernameOrEmailAddress)}</p>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label-password">
        <input
          type="password"
          name="password"
          placeholder={signInPassword.form.passwordInputPlaceholder}
          value={props.values.password}
          onChange={props.onChangeField}
          disabled={props.isLoading}
          autoFocus={true}
        />
        <span className="forgot-password" onClick={props.handleForgot}>
          {signInPassword.form.forgotLabel}
        </span>
      </div>
      <div className="button">
        <button
          className={`button-lost ${
            props.isLoading ? 'button-is-loading' : ''
          }`}
          onClick={props.onCLickSignInWithPassword}
          disabled={props.disabled}
        >
          {props.isLoading ? renderLoadingContent() : renderBaseContent(props)}
        </button>
      </div>
    </form>
  </div>
);

const renderBaseContent = props => {
  return props.hasTwoFactorAuth ? (
    <span className="button-text">{signInPassword.buttons.nextLabel}</span>
  ) : (
    <span className="button-text">{signInPassword.buttons.confirmLabel}</span>
  );
};

const renderLoadingContent = () => (
  <div className="loading">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
);

const defineEmailAddress = usernameOrEmailAddress => {
  return usernameOrEmailAddress.includes('@')
    ? usernameOrEmailAddress
    : `${usernameOrEmailAddress}@${appDomain}`;
};

// eslint-disable-next-line fp/no-mutation
renderSubHeader.propTypes = {
  hasTwoFactorAuth: PropTypes.bool,
  values: PropTypes.object
};

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  onChangeField: PropTypes.func,
  validator: PropTypes.func,
  onCLickSignInWithPassword: PropTypes.func,
  handleForgot: PropTypes.func,
  disabled: PropTypes.bool,
  values: PropTypes.object,
  isLoading: PropTypes.bool
};

// eslint-disable-next-line fp/no-mutation
renderBaseContent.propTypes = {
  hasTwoFactorAuth: PropTypes.bool
};

export default SignInPassword;
