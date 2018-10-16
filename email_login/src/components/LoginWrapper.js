import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
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
import {
  validateUsername,
  checkUsernameAvailable
} from './../validators/validators';
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
  USERNAME_NOT_EXISTS: "Username doesn't exists"
};

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
    this.setState({ mode: nextMode }, async () => {
      await this.checkDisable();
    });
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    socketClient.disconnect();
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

  toggleDeviceNotApproved = ev => {
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
      disabledLoginButton: !isValid
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
    const username = this.state.values.username;
    const isAvailable = await checkUsernameAvailable(username);
    if (isAvailable) {
      this.setState({
        errorMessage: errorMessages.USERNAME_NOT_EXISTS
      });
    } else {
      await this.initLinkDevice(username);
    }
  };

  goToPasswordLogin = () => {
    this.setState({
      mode: mode.LOST_DEVICES
    });
  };

  initLinkDevice = async username => {
    const { status, text } = await linkBegin(username);
    if (status === 439) {
      throwError(errors.login.TOO_MANY_DEVICES);
    } else if (status === 400) {
      this.goToPasswordLogin();
    } else if (status === 200) {
      ephemeralToken = text;
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
