import React from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const Login = () => renderLogin();

const renderLogin = () => (
  <div className="login">
    {renderHeader()}
    {renderForm()}
    {renderFooter()}
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

const renderForm = () => (
  <div className="form">
    <form>
      <div className="label">
        <label>
          <input type="text" placeholder="Username" /> &nbsp;
          <span>@criptext.com</span>
          <div className="clear" />
        </label>
      </div>
      <div className="button">
        <button className="button-login">
          <span>Log In</span>
        </button>
      </div>
    </form>
  </div>
);

const renderFooter = () => (
  <div className="footer">
    <div className="signup-message">
      <span>
        Not registered yet? &nbsp;
        <Link to="/">
          <strong>Sign up</strong>
        </Link>
      </span>
    </div>
    <div className="login-problems">
      <span>
        Can&#39;t
        <Link to="/">
          <strong>Log In</strong>
        </Link>
        ?
      </span>
    </div>
  </div>
);

export default Login;
