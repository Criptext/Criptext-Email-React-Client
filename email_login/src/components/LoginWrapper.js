import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
  createTemporalAccount,
  deleteTemporalAccount,
  socketClient,
  confirmWaitingApprovalLogin
} from './../utils/electronInterface';
import {
  canLogin,
  checkAvailableUsername,
  closeLoginWindow,
  getComputerName,
  linkAuth,
  linkBegin,
  linkStatus,
  openCreateKeysLoadingWindow,
  throwError
} from '../utils/ipc.js';
import { validateEmail, validateUsername } from './../validators/validators';
import { DEVICE_TYPE, appDomain } from '../utils/const';
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
  EMAILADDRESS_NOT_EXISTS: login.errorMessages.emailAddressNotExits,
  USERNAME_EMAILADDRESS_INVALID:
    login.errorMessages.usernameOrEmailAddressInvalid,
  USERNAME_INVALID: login.errorMessages.usernameInvalid,
  USERNAME_NOT_EXISTS: login.errorMessages.usernameNotExits,
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
  !!state.errorMessage || state.values.usernameOrEmailAddress === '';

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
        usernameOrEmailAddress: '',
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
            checkAvailableUsername={checkAvailableUsername}
            onFormReady={this.onFormReady}
            onSubmitWithoutRecoveryEmail={this.onSubmitWithoutRecoveryEmail}
            onToggleSignUp={this.handleToggleSignUp}
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
            cleanState={this.cleanState}
            dismissPopup={this.dismissPopup}
            goToWaitingApproval={this.goToWaitingApproval}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
            setPopupContent={this.setPopupContent}
            toggleLostAllDevices={ev => this.toggleLostAllDevices(ev)}
            value={this.state.values.usernameOrEmailAddress}
          />
        );
      default:
        return (
          <Login
            disabledLoginButton={shouldDisableLogin(this.state)}
            errorMessage={this.state.errorMessage}
            onClickSignIn={this.handleClickSignIn}
            onChangeField={this.handleChange}
            onToggleSignUp={this.handleToggleSignUp}
            value={this.state.values.usernameOrEmailAddress}
          />
        );
    }
  };

  handleToggleSignUp = e => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.mode === mode.LOGIN) {
      this.setState(curState => ({
        mode: curState.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN
      }));
    } else if (this.state.mode === mode.SIGNUP) {
      this.setState({ mode: mode.LOGIN });
    }
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

  handleSignInAnotherAccount = async () => {
    this.dismissPopup();
    await this.initLinkDevice(this.state.values.usernameOrEmailAddress);
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

  handleCanLoginResponse = emailAddress => ({ status }) => {
    this.setState(state => {
      if (state.values.usernameOrEmailAddress !== emailAddress) return state;
      if (state.errorMessage) return state;

      switch (status) {
        case 200:
          return { errorMessage: '' };

        case 400:
          return {
            errorMessage: errorMessages.EMAILADDRESS_NOT_EXISTS
          };
        default:
          return {
            errorMessage: errorMessages.STATUS_UNKNOWN + status
          };
      }
    });
  };

  handleCheckUsernameResponse = username => ({ status }) => {
    this.setState(state => {
      if (state.values.usernameOrEmailAddress !== username) return state;
      if (state.errorMessage) return state;

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
    const usernameOrEmailAddress = event.target.value;
    if (!usernameOrEmailAddress) {
      return this.setState({
        values: {
          ...this.state.values,
          usernameOrEmailAddress: usernameOrEmailAddress
        },
        errorMessage: ''
      });
    }
    const isUsernameValid = validateUsername(usernameOrEmailAddress);
    const isEmailAddressValid = validateEmail(usernameOrEmailAddress);
    if (!isUsernameValid && !isEmailAddressValid) {
      return this.setState({
        values: {
          ...this.state.values,
          usernameOrEmailAddress: usernameOrEmailAddress
        },
        errorMessage: errorMessages.USERNAME_EMAILADDRESS_INVALID
      });
    }
    if (this.lastCheck) clearTimeout(this.lastCheck);

    this.lastCheck = setTimeout(() => {
      if (this.state.values.usernameOrEmailAddress !== usernameOrEmailAddress)
        return;

      if (isUsernameValid) {
        checkAvailableUsername(usernameOrEmailAddress).then(
          this.handleCheckUsernameResponse(usernameOrEmailAddress)
        );
      } else if (isEmailAddressValid) {
        const [username, domain] = usernameOrEmailAddress.split('@');
        canLogin({ username, domain }).then(
          this.handleCanLoginResponse(usernameOrEmailAddress)
        );
      }
    }, 300);

    this.setState({
      values: {
        ...this.state.values,
        usernameOrEmailAddress: usernameOrEmailAddress
      },
      errorMessage: ''
    });
  };

  handleClickSignIn = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    // eslint-disable-next-line fp/no-let
    let recipientId = this.state.values.usernameOrEmailAddress;
    if (recipientId.includes(`@${appDomain}`)) {
      // eslint-disable-next-line fp/no-mutation
      [recipientId] = recipientId.split('@');
    }
    const [existsAccount] = await getAccountByParams({
      recipientId
    });
    if (!existsAccount) {
      const check = await this.checkLoggedOutAccounts();
      if (check === true) {
        await this.initLinkDevice(recipientId);
      }
    } else {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!existsAccount.isLoggedIn) {
        this.setState({
          errorMessage: errorMessages.ACCOUNT_ALREADY_ADDED
        });
        return;
      }
      await this.initLinkDevice(recipientId);
    }
  };

  checkLoggedOutAccounts = async () => {
    const loggedOutAccounts = await getAccountByParams({
      isLoggedIn: false
    });
    if (loggedOutAccounts.length) {
      this.setState({
        mode: mode.LOGIN,
        popupContent: {
          title: login.loginNewAccount.title,
          prefix: login.loginNewAccount.prefix,
          list: this.formLoggedOutAccountsList(loggedOutAccounts),
          suffix: login.loginNewAccount.suffix,
          cancelButtonLabel: login.loginNewAccount.cancelButtonLabel,
          confirmButtonLabel: login.loginNewAccount.confirmButtonLabel
        }
      });
      return false;
    }
    return true;
  };

  formLoggedOutAccountsList = loggedOutAccounts => {
    return loggedOutAccounts.map(account =>
      this.defineEmailAddress(account.recipientId)
    );
  };

  defineEmailAddress = usernameOrEmailAddress => {
    return usernameOrEmailAddress.includes('@')
      ? usernameOrEmailAddress
      : `${usernameOrEmailAddress}@${appDomain}`;
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
        this.initLinkDevice(this.state.values.usernameOrEmailAddress);
      }
    );
  };

  obtainEphemeralToken = async ({ username, domain }) => {
    const { status, text } = await linkBegin({ username, domain });
    if (status === 439) {
      throwError(string.errors.tooManyDevices);
    } else if (status === 400) {
      return this.goToPasswordLogin();
    } else if (status === 404) {
      this.setState(state => ({
        values: {
          usernameOrEmailAddress: state.values.usernameOrEmailAddress,
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

  initLinkDevice = async usernameOrEmailAddress => {
    const [username, domain = appDomain] = usernameOrEmailAddress.split('@');
    if (!this.state.ephemeralToken) {
      await this.obtainEphemeralToken({
        username,
        domain
      });
    }
    if (this.state.hasTwoFactorAuth && !this.state.values.password) {
      this.goToPasswordLogin();
    } else if (this.state.ephemeralToken) {
      const response = await this.sendLoginConfirmationRequest(
        this.state.ephemeralToken
      );
      if (response) {
        this.setState({ mode: mode.CONTINUE }, () => {
          // eslint-disable-next-line fp/no-let
          let recipientId = usernameOrEmailAddress;
          // eslint-disable-next-line fp/no-mutation
          if (domain === appDomain) recipientId = username;
          createTemporalAccount({ recipientId });
          socketClient.start({ jwt: this.state.ephemeralToken });
          this.checkLinkStatus();
        });
      } else {
        this.goToPasswordLogin();
      }
    }
  };

  sendLoginConfirmationRequest = async ephemeralToken => {
    const [
      recipientId,
      domain
    ] = this.state.values.usernameOrEmailAddress.split('@');
    const pcName = await getComputerName();
    const newDeviceData = {
      recipientId,
      domain: domain || appDomain,
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
            recipientId: this.state.values.usernameOrEmailAddress
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
        usernameOrEmailAddress: '',
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
