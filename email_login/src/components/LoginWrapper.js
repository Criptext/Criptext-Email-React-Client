import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
  checkAvailableUsername,
  createTemporalAccount,
  deleteTemporalAccount,
  linkBegin,
  linkAuth,
  linkStatus,
  socketClient,
  errors,
  confirmWaitingApprovalLogin
} from './../utils/electronInterface';
import {
  closeLoginWindow,
  getComputerName,
  openCreateKeysLoadingWindow,
  throwError
} from '../utils/ipc.js';
import { validateUsername } from './../validators/validators';
import { DEVICE_TYPE } from '../utils/const';
import DeviceNotApproved from './DeviceNotApproved';
import { hashPassword } from '../utils/HashUtils';
import string from './../lang';

import PopupHOC from './PopupHOC';
import LoginPopup from './LoginPopup';
import DialogPopup from './DialogPopup';

const { login, signin } = string;

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE',
  DEVICE_NOT_APPROVED: 'DEVICE_NOT_APPROVED',
  LOST_DEVICES: 'LOST_DEVICES'
};

const errorMessages = {
  USERNAME_NOT_EXISTS: login.errorMessages.usernameNotExits,
  USERNAME_INVALID: login.errorMessages.usernameInvalid,
  STATUS_UNKNOWN: login.errorMessages.statusUnknown,
  USERNAME_NOT_AVAILABLE: login.errorMessages.usernameNotAvailable
};

const LINK_STATUS_RETRIES = 12;
// eslint-disable-next-line fp/no-let
let LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
const LINK_STATUS_DELAY = 5000;
const rejectedDeviceStatus = 493;
const approvedDeviceStastus = 200;

const shouldDisableLogin = state =>
  !!state.errorMessage || state.values.username === '';

const LoginWithPasswordPopup = PopupHOC(DialogPopup);
const ResetPasswordPopup = PopupHOC(LoginPopup);
const NoRecoverySignUpPopup = PopupHOC(DialogPopup);

const commitNewUser = validInputData => {
  openCreateKeysLoadingWindow({
    loadingType: 'signup',
    remoteData: validInputData
  });
  closeLoginWindow();
};

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
      hasTwoFactorAuth: undefined,
      popupContent: undefined
    };
  }

  render() {
    return (
      <div>
        {this.renderPopup()}
        {this.renderSection()}
      </div>
    );
  }

  renderPopup = () => {
    if (!this.state.popupContent) {
      return null;
    }

    switch (this.state.mode) {
      case mode.CONTINUE:
        return (
          <LoginWithPasswordPopup
            {...this.state.popupContent}
            onLeftButtonClick={this.handleStayLinking}
            onRightButtonClick={this.handleCancelLink}
          />
        );
      case mode.LOST_DEVICES:
        return (
          <ResetPasswordPopup
            {...this.state.popupContent}
            onDismiss={this.dismissPopup}
          />
        );
      case mode.SIGNUP:
        return (
          <NoRecoverySignUpPopup
            {...this.state.popupContent}
            onLeftButtonClick={this.dismissPopup}
            onRightButtonClick={this.handleSignUpContinue}
          />
        );
      default:
        return null;
    }
  };

  renderSection = () => {
    switch (this.state.mode) {
      case mode.SIGNUP:
        return (
          <SignUpWrapper
            toggleSignUp={ev => this.toggleSignUp(ev)}
            checkAvailableUsername={checkAvailableUsername}
            onFormReady={this.onFormReady}
            onSubmitWithoutRecoveryEmail={this.onSubmitWithoutRecoveryEmail}
          />
        );
      case mode.CONTINUE:
        return (
          <ContinueLogin
            onLeftButtonClick={this.handlePopupLeftButton}
            onRightButtonClick={this.handlePopupRightButton}
            popupContent={this.state.popupContent}
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
            setPopupContent={this.setPopupContent}
            dismissPopup={this.dismissPopup}
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
  };

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const nextMode = this.state.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN;
    this.setState({ mode: nextMode });
  };

  onSubmitWithoutRecoveryEmail = validInputData => {
    this.setState({
      popupContent: {
        title: signin.title,
        prefix: signin.prefix,
        strong: signin.strong,
        suffix: signin.suffix,
        leftButtonLabel: signin.leftButtonLabel,
        rightButtonLabel: signin.rightButtonLabel,
        data: validInputData
      }
    });
  };

  onFormReady = validInputData => {
    if (validInputData.recoveryEmail === '')
      return this.onSubmitWithoutRecoveryEmail(validInputData);
    commitNewUser(validInputData);
  };

  handleSignUpContinue = () => {
    const inputData = this.state.popupContent.data;
    console.log(inputData);
    if (!inputData) {
      return;
    }
    this.setState(
      {
        popupContent: undefined
      },
      () => {
        commitNewUser(inputData);
      }
    );
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    socketClient.disconnect();
    this.stopCountdown();
    const nextMode =
      this.state.mode === mode.LOGIN ? mode.CONTINUE : mode.LOGIN;
    this.setState({ mode: nextMode }, this.cleanState);
  };

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ mode: mode.LOGIN }, this.cleanState);
  };

  toggleDeviceNotApproved = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ mode: mode.LOGIN }, this.cleanState);
  };

  stopCountdown = () => {
    clearTimeout(this.linkStatusTimeout);
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
        case 410: {
          return {
            errorMessage: errorMessages.USERNAME_NOT_AVAILABLE
          };
        }
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
    } else if (status === 404) {
      this.setState(prevState => ({
        values: {
          username: prevState.values.username,
          password: ''
        },
        disabledResendLoginRequest: false,
        errorMessage: errorMessages.USERNAME_NOT_AVAILABLE,
        ephemeralToken: undefined,
        hasTwoFactorAuth: undefined
      }));
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
    this.stopCountdown();
    this.setState({
      popupContent: {
        title: login.usePassword.title,
        prefix: login.usePassword.prefix,
        strong: login.usePassword.strong,
        suffix: login.usePassword.suffix,
        leftButtonLabel: login.usePassword.leftButtonLabel,
        rightButtonLabel: login.usePassword.rightButtonLabel
      }
    });
  };

  setPopupContent = popupContent => {
    this.setState({ popupContent });
  };

  dismissPopup = () => {
    this.setState({ popupContent: undefined });
  };

  handleStayLinking = () => {
    this.setState({ popupContent: undefined }, () => {
      this.checkLinkStatus();
    });
  };

  handleCancelLink = () => {
    socketClient.disconnect();
    this.setState({ popupContent: undefined }, () => {
      this.goToPasswordLogin();
    });
  };

  handleClickResendLoginRequest = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ disabledResendLoginRequest: true }, async () => {
      this.stopCountdown();
      const response = await this.sendLoginConfirmationRequest(
        this.state.ephemeralToken
      );
      if (response) {
        this.checkLinkStatus();
        setTimeout(() => {
          this.setState({ disabledResendLoginRequest: false });
        }, 2000);
      }
    });
  };

  checkLinkStatus = async () => {
    if (LINK_STATUS_ATTEMPS === 0) {
      this.stopCountdown();
      confirmWaitingApprovalLogin(shouldKeepWaiting => {
        if (shouldKeepWaiting) {
          // eslint-disable-next-line fp/no-mutation
          LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
          this.checkLinkStatus();
        } else {
          this.setState({ mode: mode.LOGIN }, () => {
            this.cleanState();
            // eslint-disable-next-line fp/no-mutation
            LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
          });
        }
      });
    } else {
      const { status, body } = await linkStatus();
      switch (status) {
        case rejectedDeviceStatus: {
          this.stopCountdown();
          socketClient.disconnect();
          this.setState({
            mode: mode.DEVICE_NOT_APPROVED
          });
          return;
        }
        case approvedDeviceStastus: {
          this.stopCountdown();
          socketClient.disconnect();
          const remoteData = {
            ...body,
            recipientId: this.state.values.username
          };
          openCreateKeysLoadingWindow({
            loadingType: 'link-new-device',
            remoteData
          });
          deleteTemporalAccount();
          closeLoginWindow();
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
