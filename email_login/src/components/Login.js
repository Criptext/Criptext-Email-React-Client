import React from 'react';
import './login.css';


const Login = props => renderLogin(props);


const renderLogin = (props) => (
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
      <span>Welcome to Criptext!</span>
    </div>
  </div>
);


const renderForm = (props) => (
  <div className="form">
    <form autoComplete="off">
      <div className="label">
        <label>
          <input 
            type="text" 
            name="username"
            placeholder="Username" 
            onChange={props.onChangeField} 
            onKeyUp={props.validator}
          /> &nbsp;
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


const renderFooter = (props) => (
  <div className="footer">
    <div className="signup-message">
      <span>
        Not registered yet? &nbsp;
        <strong onClick={ev => props.toggleSignUp(ev)}>Sign up</strong>
      </span>
    </div>
    <div className="login-problems">
      <span>
        Can&#39;t
        <strong> Log In</strong>
        ?
      </span>
    </div>
  </div>
);


export default Login;
