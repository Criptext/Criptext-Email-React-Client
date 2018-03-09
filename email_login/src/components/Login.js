import React from 'react';
import PropTypes from 'prop-types';
import { closeLogin, minimizeLogin } from './../utils/electronInterface';
import './login.css';

const Login = props => renderLogin(props);

const renderLogin = props => (
  <div>
    <div className="login-title-bar">
      <span className="buttons">
        <span class="login-close" onClick={ev => closeLogin()} />
        <span class="login-minimize" onClick={ev => minimizeLogin()} />
      </span>
    </div>
    <div className="clear-title"></div>
    <div className="login">
      {renderHeader()}
      {renderForm(props)}
      {renderFooter(props)}
    </div>
  </div>
);

const renderHeader = () => (
  <div className="header">
    <div className="logo">
      <div className="icon" />
    </div>
    <div className="text">
      <span>Welcome to Criptext!</span>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label">
        <label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={props.value}
            onChange={props.onChangeField}
            onKeyUp={props.validator}
          />
          &nbsp;
          <span>@criptext.com</span>
          <div className="clear" />
        </label>
      </div>
      <div className="button">
        <button
          className="button-login"
          onClick={ev => props.handleSubmit(ev)}
          disabled={props.disabled}
        >
          <span>Log In</span>
        </button>
      </div>
    </form>
  </div>
);

const renderFooter = props => (
  <div className="footer">
    <div className="signup-message">
      <span>
        Not registered? &nbsp;
        <strong onClick={ev => props.toggleSignUp(ev)}>Sign up</strong>
      </span>
    </div>
    <div className="login-problems">
      <span onClick={ev => props.handleLostDevices(ev)}>
        Lost all your devices?
      </span>
    </div>
  </div>
);

renderForm.propTypes = {
  onChangeField: PropTypes.func,
  validator: PropTypes.func,
  handleSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  value: PropTypes.string
};

renderFooter.propTypes = {
  toggleSignUp: PropTypes.func,
  handleLostDevices: PropTypes.func
};

export default Login;
