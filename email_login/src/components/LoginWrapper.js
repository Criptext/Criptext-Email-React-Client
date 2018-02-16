import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import ContinueLogin from './ContinueLogin';
import { closeLogin, openMailbox } from './../utils/electronInterface';
import { validateUsername } from './../validators/validators';

let timeCountdown;

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      showSignUp: false,
      showContinue: false,
      values: {
        username: ''
      },
      disabled: true
    };
  }

  componentDidMount() {
    this.checkDisable();
  }

  render() {
    if (this.state.showSignUp) {
      return <SignUpWrapper toggleSignUp={ev => this.toggleSignUp(ev)} />;
    }
    if (this.state.showContinue) {
      return <ContinueLogin toggleContinue={ev => this.toggleContinue(ev)} />;
    }
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

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      showSignUp: !this.state.showSignUp,
      showContinue: false
    });
    this.checkDisable();
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.stopCountdown();
    this.setState({
      showSignUp: false,
      showContinue: !this.state.showContinue
    });
    this.checkDisable();
  };

  stopCountdown = () => {
    clearTimeout(timeCountdown);
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
      showSignUp: false,
      showContinue: true
    });
    timeCountdown = setTimeout(() => {
      openMailbox();
      closeLogin();
    }, 8000);
  };
}

export default LoginWrapper;
