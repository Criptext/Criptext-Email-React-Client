import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpElectronWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
  checkAvailableUsername,
  closeLogin,
  confirmLostDevices,
  createTemporalAccount,
  deleteTemporalAccount,
  linkBegin,
  linkAuth,
  linkStatus,
  openCreateKeys,
  socketClient,
  throwError,
  errors
} from './../utils/electronInterface';
import { closeDialog, getComputerName } from '../utils/ipc.js';
import { validateUsername } from './../validators/validators';
import { DEVICE_TYPE } from '../utils/const';
import DeviceNotApproved from './DeviceNotApproved';
import { hashPassword } from '../utils/HashUtils';

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

const LINK_STATUS_RETRIES = 12;
// eslint-disable-next-line fp/no-let
let LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
const LINK_STATUS_DELAY = 5000;
const rejectedDeviceStatus = 493;
const approvedDeviceStastus = 200;

const shouldDisableLogin = state =>
  !!state.errorMessage || state.values.username === '';

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.LOGIN,
      values: {
        username: '',
        password: ''
      },
      disabledResendLoginRequest: false,
      errorMessage: '',
      ephemeralToken: undefined,
      hasTwoFactorAuth: undefined
    };
    this.timeCountdown = 0;
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
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
          />
        );
      case mode.DEVICE_NOT_APPROVED:
        return (
          <DeviceNotApproved
            toggleDeviceNotApproved={this.toggleDeviceNotApproved}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
          />
        );
      case mode.LOST_DEVICES:
        return (
          <LostAllDevicesWrapper
            usernameValue={this.state.values.username}
            toggleLostAllDevices={ev => this.toggleLostAllDevices(ev)}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
            goToWaitingApproval={this.goToWaitingApproval}
          />
        );
      default:
        return (
          <Login
            toggleSignUp={ev => this.toggleSignUp(ev)}
            onClickSignIn={this.handleClickSignIn}
            onChangeField={this.handleChange}
            disabledLoginButton={shouldDisableLogin(this.state)}
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
    this.setState(
      {
        mode: nextMode
      },
      () => this.cleanState()
    );
  };

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState(
      {
        mode: mode.LOGIN
      },
      () => this.cleanState()
    );
  };

  toggleDeviceNotApproved = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState(
      {
        mode: mode.LOGIN
      },
      () => this.cleanState()
    );
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
            errorMessage: errorMessages.USERNAME_NOT_EXISTS
          };
        case 422:
          return {
            errorMessage: errorMessages.USERNAME_INVALID
          };
        case 400:
          return { errorMessage: '' };
        default:
          return {
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

  goToWaitingApproval = password => {
    this.setState(
      {
        mode: mode.CONTINUE,
        values: {
          ...this.state.values,
          password
        }
      },
      () => {
        this.initLinkDevice(this.state.values.username);
      }
    );
  };

  obtainEphemeralToken = async username => {
    const { status, text } = await linkBegin(username);
    if (status === 439) {
      throwError(errors.login.TOO_MANY_DEVICES);
    } else if (status === 400) {
      return this.goToPasswordLogin();
    } else if (status === 200) {
      const { twoFactorAuth, token } = JSON.parse(text);
      this.setState({
        ephemeralToken: token,
        hasTwoFactorAuth: !!twoFactorAuth
      });
    }
  };

  initLinkDevice = async username => {
    if (!this.state.ephemeralToken) {
      await this.obtainEphemeralToken(username);
    }
    if (this.state.hasTwoFactorAuth && !this.state.values.password) {
      this.goToPasswordLogin();
    } else if (this.state.ephemeralToken) {
      const response = await this.sendLoginConfirmationRequest(
        this.state.ephemeralToken
      );
      if (response) {
        this.setState({ mode: mode.CONTINUE }, () => {
          createTemporalAccount({ recipientId: username });
          socketClient.start({ jwt: this.state.ephemeralToken });
          this.checkLinkStatus();
        });
      } else {
        this.goToPasswordLogin();
      }
    }
  };

  sendLoginConfirmationRequest = async ephemeralToken => {
    const recipientId = this.state.values.username;
    const pcName = await getComputerName();
    const newDeviceData = {
      recipientId,
      deviceName: pcName || window.navigator.platform,
      deviceFriendlyName: pcName || window.navigator.platform,
      deviceType: DEVICE_TYPE
    };
    if (this.state.hasTwoFactorAuth) {
      // eslint-disable-next-line fp/no-mutation
      newDeviceData.password = hashPassword(this.state.values.password);
    }
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
        clearTimeout(this.linkStatusTimeout);
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
      const response = await this.sendLoginConfirmationRequest(
        this.state.ephemeralToken
      );
      if (response) {
        setTimeout(() => {
          this.setState({ disabledResendLoginRequest: false });
        }, 2000);
      }
    });
  };

  checkLinkStatus = async () => {
    if (LINK_STATUS_ATTEMPS === 0) {
      throwError({ name: 'Error', description: 'No response. Try again.' });
      this.setState(
        {
          mode: mode.LOGIN
        },
        () => {
          this.cleanState();
          // eslint-disable-next-line fp/no-mutation
          LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
        }
      );
    } else {
      const { status, body } = await linkStatus();
      switch (status) {
        case rejectedDeviceStatus: {
          clearTimeout(this.linkStatusTimeout);
          socketClient.disconnect();
          this.setState({
            mode: mode.DEVICE_NOT_APPROVED
          });
          return;
        }
        case approvedDeviceStastus: {
          clearTimeout(this.linkStatusTimeout);
          socketClient.disconnect();
          const remoteData = {
            ...body,
            recipientId: this.state.values.username
          };
          openCreateKeys({ loadingType: 'link-new-device', remoteData });
          deleteTemporalAccount();
          closeLogin();
          return;
        }
        default: {
          this.linkStatusTimeout = await setTimeout(
            this.checkLinkStatus,
            LINK_STATUS_DELAY
          );
          // eslint-disable-next-line fp/no-mutation
          LINK_STATUS_ATTEMPS--;
        }
      }
    }
  };

  cleanState = () => {
    this.setState({
      values: {
        username: '',
        password: ''
      },
      disabledResendLoginRequest: false,
      errorMessage: '',
      ephemeralToken: undefined,
      hasTwoFactorAuth: undefined
    });
  };
}

export default LoginWrapper;
