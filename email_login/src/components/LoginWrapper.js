import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import { closeDialog, confirmLostDevices } from './../utils/electronInterface';
import {
  validateUsername,
  checkUsernameAvailable
} from './../validators/validators';

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE',
  LOST_DEVICES: 'LOST_DEVICES'
};

const errorMessages = {
  USERNAME_NOT_EXISTS: "Username doesn't exists"
};

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.LOGIN,
      values: {
        username: ''
      },
      disabled: true,
      errorMessage: ''
    };
    this.timeCountdown = 0;
  }

  async componentDidMount() {
    await this.checkDisable();
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
            value={this.state.values.username}
            handleLostDevices={this.handleLostDevices}
            errorMessage={this.state.errorMessage}
          />
        );
    }
  }

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const nextMode = this.state.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN;
    this.setState({ mode: nextMode }, async () => {
      await this.checkDisable();
    });
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.stopCountdown();
    const nextMode =
      this.state.mode === mode.LOGIN ? mode.CONTINUE : mode.LOGIN;
    this.setState({ mode: nextMode }, async () => {
      await this.checkDisable();
    });
  };

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState(
      {
        mode: mode.LOGIN
      },
      async () => {
        await this.checkDisable();
      }
    );
  };

  stopCountdown = () => {
    clearTimeout(this.timeCountdown);
  };

  validateUsername = async () => {
    const username = this.state.values['username'];
    return await validateUsername(username);
  };

  checkDisable = async () => {
    const isValid = await this.validateUsername();
    this.setState({
      disabled: !isValid
    });
  };

  handleChange = event => {
    const values = { ...this.state.values };
    values[event.target.name] = event.target.value;
    this.setState({ values, errorMessage: '' }, async () => {
      await this.checkDisable();
    });
  };

  handleClickSignIn = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const isAvailable = await checkUsernameAvailable(
      this.state.values.username
    );
    if (isAvailable) {
      this.setState({
        errorMessage: errorMessages.USERNAME_NOT_EXISTS
      });
    } else {
      this.setState({
        mode: mode.LOST_DEVICES
      });
    }
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
