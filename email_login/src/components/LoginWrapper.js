import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import { closeDialog, confirmLostDevices } from './../utils/electronInterface';
import { validateUsername } from './../validators/validators';

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE',
  LOST_DEVICES: 'LOST_DEVICES'
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
        return (
          <ContinueLogin
            toggleContinue={ev => this.toggleContinue(ev)}
            handleLostDevices={ev => this.handleLostDevices(ev)}
          />
        );
      case mode.LOST_DEVICES:
        return (
          <LostAllDevicesWrapper
            usernameValue={this.state.values.username}
            toggleLostAllDevices={ev => this.toggleLostAllDevices(ev)}
          />
        );
      default:
        return (
          <Login
            toggleSignUp={ev => this.toggleSignUp(ev)}
            onClickSignIn={this.handleClickSignIn}
            onChangeField={this.handleChange}
            disabled={this.state.disabled}
            validator={this.validateUsername}
            value={this.state.values.username}
            handleLostDevices={this.handleLostDevices}
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

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      mode: mode.LOGIN
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
    const values = { ...this.state.values };
    values[event.target.name] = event.target.value;
    this.setState({ values }, () => {
      this.checkDisable();
    });
  };

  handleClickSignIn = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      mode: mode.CONTINUE
    });
  };

  handleLostDevices = event => {
    event.preventDefault();
    event.stopPropagation();
    confirmLostDevices(response => {
      closeDialog();
      if (response === 'Continue') {
        this.onLostDevices();
      }
    });
  };

  onLostDevices = () => {
    this.stopCountdown();
    this.setState({
      mode: mode.LOST_DEVICES
    });
  };
}

export default LoginWrapper;
