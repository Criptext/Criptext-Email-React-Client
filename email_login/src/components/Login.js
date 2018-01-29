import React, { Component } from 'react';
import SignUp from './SignUp';
import './login.css';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      showSignUp: false
    };
  }

  render() {
    return <div>{this.renderLogin()}</div>;
  }

  renderLogin = () => {
    if (this.state.showSignUp) {
      return <SignUp toggleSignUp={ev => this.toggleSignUp(ev)} />;
    }
    return (
      <div className="login">
        {this.renderHeader()}
        {this.renderForm()}
        {this.renderFooter()}
      </div>
    );
  };

  renderHeader = () => {
    return (
      <div className="header">
        <div className="logo">
          <div className="icon" />
        </div>
        <div className="text">
          <span>Welcome to Criptext!</span>
        </div>
      </div>
    );
  };

  renderForm = () => {
    return (
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
  };

  renderFooter = () => {
    return (
      <div className="footer">
        <div className="signup-message">
          <span>
            Not registered yet? &nbsp;
            <strong onClick={ev => this.toggleSignUp(ev)}>Sign up</strong>
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
  };

  toggleSignUp = ev => {
    ev.preventDefault();
    this.setState({ showSignUp: !this.state.showSignUp });
  };
}

export default Login;
