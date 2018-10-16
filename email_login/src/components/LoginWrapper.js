import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpElectronWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
  checkAvailableUsername,
  closeDialog,
  closeLogin,
  confirmLostDevices,
  createTemporalAccount,
  deleteTemporalAccount,
  getComputerName,
  linkBegin,
  linkAuth,
  openCreateKeys,
  socketClient,
  throwError,
  errors
} from './../utils/electronInterface';
import { validateUsername } from './../validators/validators';
import { DEVICE_TYPE } from '../utils/const';
import { addEvent, Event } from '../utils/electronEventInterface';
import DeviceNotApproved from './DeviceNotApproved';

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE',
  DEVICE_NOT_APPROVED: 'DEVICE_NOT_APPROVED',
  LOST_DEVICES: 'LOST_DEVICES'
};

const errorMessages = {
  USERNAME_NOT_EXISTS: "Username doesn't exist",
  USERNAME_INVALID: 'Invalid username',
  STATUS_UNKNOWN: 'Unknown status code: '
};

// eslint-disable-next-line fp/no-let
let ephemeralToken;

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.LOGIN,
      values: {
        username: ''
      },
      disabledLoginButton: true,
      disabledResendLoginRequest: false,
      errorMessage: ''
    };
    this.timeCountdown = 0;
    this.initEventListeners();
  }

  render() {
    switch (this.state.mode) {
      case mode.SIGNUP:
        return <SignUpWrapper toggleSignUp={ev => this.toggleSignUp(ev)} />;
      case mode.CONTINUE:
        return (
          <ContinueLogin
            disabledResendLoginRequest={this.state.disabledResendLoginRequest}
            toggleContinue={this.toggleContinue}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            onClickResendLoginRequest={this.handleClickResendLoginRequest}
          />
        );
      case mode.DEVICE_NOT_APPROVED:
        return (
          <DeviceNotApproved
            toggleDeviceNotApproved={this.toggleDeviceNotApproved}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
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
            disabledLoginButton={this.state.disabledLoginButton}
            value={this.state.values.username}
            errorMessage={this.state.errorMessage}
          />
        );
    }
  }

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const nextMode = this.state.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN;
    this.setState({ mode: nextMode });
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    socketClient.disconnect();
    this.stopCountdown();
    const nextMode =
      this.state.mode === mode.LOGIN ? mode.CONTINUE : mode.LOGIN;
    this.setState({ mode: nextMode });
  };

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      mode: mode.LOGIN
    });
  };

  toggleDeviceNotApproved = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      mode: mode.LOGIN
    });
  };

  stopCountdown = () => {
    clearTimeout(this.timeCountdown);
  };

  handleCheckUsernameResponse = newUsername => ({ status }) => {
    this.setState(curState => {
      if (curState.values.username !== newUsername) return curState;

      switch (status) {
        case 200:
          return {
            disabledLoginButton: true,
            errorMessage: errorMessages.USERNAME_NOT_EXISTS
          };
        case 422:
          return {
            disabledLoginButton: true,
            errorMessage: errorMessages.USERNAME_INVALID
          };
        case 400:
          return { disabledLoginButton: false, errorMessage: '' };
        default:
          return {
            disabledLoginButton: true,
            errorMessage: errorMessages.STATUS_UNKNOWN + status
          };
      }
    });
  };

  handleChange = event => {
    const newUsername = event.target.value;

    if (!newUsername)
      return this.setState({
        values: { ...this.state.values, username: newUsername },
        errorMessage: ''
      });

    if (!validateUsername(newUsername))
      return this.setState({
        values: { ...this.state.values, username: newUsername },
        errorMessage: errorMessages.USERNAME_INVALID
      });

    if (this.lastCheck) clearTimeout(this.lastCheck);

    this.lastCheck = setTimeout(() => {
      if (this.state.values.username !== newUsername) return;

      checkAvailableUsername(newUsername).then(
        this.handleCheckUsernameResponse(newUsername)
      );
    }, 300);

    this.setState({
      values: { ...this.state.values, username: newUsername },
      errorMessage: ''
    });
  };

  handleClickSignIn = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const username = this.state.values.username;
    await this.initLinkDevice(username);
  };

  goToPasswordLogin = () => {
    this.setState({
      mode: mode.LOST_DEVICES
    });
  };

  obtainEphemeralToken = async username => {
    const { status, text } = await linkBegin(username);
    if (status === 439) {
      throwError(errors.login.TOO_MANY_DEVICES);
    } else if (status === 400) {
      return this.goToPasswordLogin();
    } else if (status === 200) {
      // eslint-disable-next-line fp/no-mutation
      ephemeralToken = text;
    }
  };

  initLinkDevice = async username => {
    await this.obtainEphemeralToken(username);
    if (ephemeralToken) {
      const response = await this.sendLoginConfirmationRequest(ephemeralToken);
      if (response) {
        this.setState({ mode: mode.CONTINUE }, () => {
          createTemporalAccount({ recipientId: username });
          socketClient.start({ jwt: ephemeralToken });
        });
      } else {
        this.goToPasswordLogin();
      }
    }
  };

  sendLoginConfirmationRequest = async ephemeralToken => {
    const recipientId = this.state.values.username;
    const pcName = getComputerName();
    const newDeviceData = {
      recipientId,
      deviceName: pcName || window.navigator.platform,
      deviceFriendlyName: pcName || window.navigator.platform,
      deviceType: DEVICE_TYPE
    };
    try {
      const { status } = await linkAuth({
        newDeviceData,
        jwt: ephemeralToken
      });
      return status === 200;
    } catch (e) {
      return false;
    }
  };

  handleClickSignInWithPassword = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    confirmLostDevices(response => {
      closeDialog();
      if (response === 'Continue') {
        socketClient.disconnect();
        this.stopCountdown();
        this.goToPasswordLogin();
      }
    });
  };

  handleClickResendLoginRequest = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ disabledResendLoginRequest: true }, async () => {
      const response = await this.sendLoginConfirmationRequest(ephemeralToken);
      if (response) {
        setTimeout(() => {
          this.setState({ disabledResendLoginRequest: false });
        }, 2000);
      }
    });
  };

  initEventListeners = () => {
    addEvent(Event.LINK_DEVICE_CONFIRMED, params => {
      socketClient.disconnect();
      openCreateKeys({ loadingType: 'link-new-device', remoteData: params });
      deleteTemporalAccount();
      closeLogin();
    });

    addEvent(Event.LINK_DEVICE_DENIED, () => {
      socketClient.disconnect();
      this.setState({
        mode: mode.DEVICE_NOT_APPROVED
      });
    });
  };
}

export default LoginWrapper;
