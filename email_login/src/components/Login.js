import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from './../utils/const';
import string from './../lang';
import './login.scss';

const { login } = string;

const Login = props => renderLogin(props);

const renderLogin = props => (
  <div className="login">
    {renderHeader()}
    {renderForm(props)}
    {renderFooter(props)}
  </div>
);

const renderHeader = () => (
  <div className="header">
    <div className="logo">
      <div className="icon" />
    </div>
    <div className="text">
      <span>{login.header}</span>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label">
        <input
          type="text"
          name="username"
          placeholder={login.usernameInputPlaceholder}
          value={props.value}
          onChange={props.onChangeField}
          autoFocus={true}
        />
        &nbsp;
        <span>{`@${appDomain}`}</span>
      </div>
      <span className="error-message">{props.errorMessage}</span>
      <div className="button">
        <button
          className="button-login"
          onClick={props.onClickSignIn}
          disabled={props.disabledLoginButton}
        >
          <span>{login.signInButtonLabel}</span>
        </button>
      </div>
    </form>
  </div>
);

const renderFooter = props => (
  <div className="footer">
    <div className="signup-message">
      <span>
        {login.signUpMessage.text} &nbsp;
        <strong onClick={e => props.onToggleSignUp(e)}>
          {login.signUpMessage.strong}
        </strong>
      </span>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  disabledLoginButton: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChangeField: PropTypes.func,
  onClickSignIn: PropTypes.func,
  value: PropTypes.string
};

// eslint-disable-next-line fp/no-mutation
renderFooter.propTypes = {
  onToggleSignUp: PropTypes.func
};

export default Login;
