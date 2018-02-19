import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import ContinueLogin from './ContinueLogin';
import { closeLogin, openMailbox } from './../utils/electronInterface';
import { validateUsername } from './../validators/validators';

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE'
};

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.LOGIN,
      values: {
        username: ''
      },
      disabled: true
    };
    this.timeCountdown = 0;
  }

  componentDidMount() {
    this.checkDisable();
  }

  render() {
    switch (this.state.mode) {
      case mode.SIGNUP:
        return <SignUpWrapper toggleSignUp={ev => this.toggleSignUp(ev)} />;
      case mode.CONTINUE:
        return <ContinueLogin toggleContinue={ev => this.toggleContinue(ev)} />;
      default:
        return (
          <Login
            toggleSignUp={ev => this.toggleSignUp(ev)}
            handleSubmit={this.handleSubmit}
            onChangeField={this.handleChange}
            disabled={this.state.disabled}
            validator={this.validateUsername}
            value={this.state.values.username}
          />
        );
    }
  }

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      mode: this.state.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN
    });
    this.checkDisable();
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.stopCountdown();
    this.setState({
      mode: this.state.mode === mode.LOGIN ? mode.CONTINUE : mode.LOGIN
    });
    this.checkDisable();
  };

  stopCountdown = () => {
    clearTimeout(this.timeCountdown);
  };

  validateUsername = () => {
    const username = this.state.values['username'];
    return validateUsername(username);
  };

  checkDisable = () => {
    const isValid = this.validateUsername();
    this.setState({
      disabled: !isValid
    });
  };

  handleChange = event => {
    const newState = this.state;
    newState.values[event.target.name] = event.target.value;
    this.setState(newState);
    this.checkDisable();
  };

  handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      mode: mode.CONTINUE
    });
    this.timeCountdown = setTimeout(() => {
      openMailbox();
      closeLogin();
    }, 8000);
    alert(this.timeCountdown);
  };
}

export default LoginWrapper;
