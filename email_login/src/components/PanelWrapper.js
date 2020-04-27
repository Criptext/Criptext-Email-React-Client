import React, { Component } from 'react';
import SignIn from './SignIn';
import SignUpWrapper from './SignUpWrapper';
import SignInPasswordWrapper from './SignInPasswordWrapper';
import SignInToApprove from './SignInToApprove';
import ChangePasswordWrapper from './ChangePasswordWrapper';
import DeleteDeviceWrapperPopup from './DeleteDeviceWrapperPopup';
import RecoveryCodeWrapperPopup from './RecoveryCodeWrapperPopup';
import UpgradeToPlusPopup from './UpgradeToPlusPopup';
import PopupHOC from './PopupHOC';
import ForgotPasswordPopup from './ForgotPasswordPopup';
import DialogPopup, { DialogTypes } from './DialogPopup';
import { ButtonState } from './Button';
import {
  createTemporalAccount,
  deleteTemporalAccount,
  hasPin,
  socketClient,
  confirmWaitingApprovalLogin,
  DEFAULT_PIN
} from './../utils/electronInterface';
import {
  canLogin,
  checkAvailableUsername,
  checkForUpdates,
  closeLoginWindow,
  getAccountByParams,
  getComputerName,
  linkAuth,
  linkBegin,
  linkCancel,
  linkStatus,
  login,
  openCreateKeysLoadingWindow,
  openPinWindow,
  sendPin,
  throwError,
  upgradeToPlus
} from '../utils/ipc.js';
import { validateEmail, validateUsername } from './../validators/validators';
import { DEVICE_TYPE, appDomain, externalDomains } from '../utils/const';
import DeviceNotApproved from './DeviceNotApproved';
import { hashPassword } from '../utils/HashUtils';
import string from './../lang';
import './panelwrapper.scss';

const { errors, help, signIn, signUp } = string;

const mode = {
  SIGNUP: 'SIGNUP',
  SIGNIN: 'SIGNIN',
  SIGNINTOAPPROVE: 'SIGNINTOAPPROVE',
  SIGNINPASSWORD: 'SIGNINPASSWORD',
  CHANGEPASSWORD: 'CHANGEPASSWORD',
  DEVICE_NOT_APPROVED: 'DEVICE_NOT_APPROVED'
};

export const popupType = {
  UPGRADE_PLUS: 'UPGRADE_PLUS',
  RECOVERY_CODE: 'RECOVERY_CODE',
  WARNING_RECOVERY_EMAIL: 'WARNING_RECOVERY_EMAIL',
  WARNING_SIGNIN_WITH_PASSWORD: 'WARNING_SIGNIN_WITH_PASSWORD',
  WARNING_SIGNIN_WITH_OTHER_DEVICE: 'WARNING_SIGNIN_WITH_OTHER_DEVICE',
  DELETE_DEVICE: 'DELETE_DEVICE',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  TOO_MANY_REQUEST: 'TOO_MANY_REQUEST'
};

const errorMessages = {
  EMAILADDRESS_NOT_EXISTS: signIn.errorMessages.emailAddressNotExits,
  EMAILADDRESS_NOT_VALID_CRIPTEXT:
    signIn.errorMessages.emailAddressNotValidCriptext,
  USERNAME_EMAILADDRESS_INVALID:
    signIn.errorMessages.usernameOrEmailAddressInvalid,
  USERNAME_INVALID: signIn.errorMessages.usernameInvalid,
  USERNAME_NOT_EXISTS: signIn.errorMessages.usernameNotExits,
  STATUS_UNKNOWN: signIn.errorMessages.statusUnknown,
  USERNAME_NOT_AVAILABLE: signIn.errorMessages.usernameNotAvailable,
  USERNAME_LOGGED_IN: signIn.errorMessages.userAlreadyLoggedIn
};

const LINK_STATUS_RETRIES = 12;
let LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
const LINK_STATUS_DELAY = 5000;
const rejectedDeviceStatus = 493;
const approvedDeviceStastus = 200;

const LoginWithPasswordPopup = PopupHOC(DialogPopup);
const ResetPasswordPopup = PopupHOC(ForgotPasswordPopup);
const NoRecoverySignUpPopup = PopupHOC(DialogPopup);
const SignInAnotherAccount = PopupHOC(DialogPopup);
const DeleteDevicePopup = PopupHOC(DeleteDeviceWrapperPopup);
const TooManyRequest = PopupHOC(DialogPopup);
const RecoveryCodePopup = PopupHOC(RecoveryCodeWrapperPopup);
const UpgradePlusPopup = PopupHOC(UpgradeToPlusPopup);

const commitNewUser = validInputData => {
  const hasPIN = hasPin();
  if (hasPIN) {
    openCreateKeysLoadingWindow({
      loadingType: 'signup',
      shouldResetPIN: !hasPIN,
      remoteData: validInputData
    });
  } else {
    openPinWindow({
      pinType: 'signup',
      remoteData: validInputData
    });
  }
  closeLoginWindow({ forceClose: true });
};

class PanelWrapper extends Component {
  constructor() {
    super();
    this.state = {
      buttonSignInState: ButtonState.DISABLED,
      contactURL: 'https://criptext.atlassian.net/servicedesk/customer/portals',
      currentStep: mode.SIGNIN,
      lastStep: [mode.SIGNIN],
      values: {
        usernameOrEmailAddress: '',
        password: ''
      },
      customerType: 0,
      disabledResendLoginRequest: false,
      errorMessage: '',
      ephemeralToken: undefined,
      hasTwoFactorAuth: undefined,
      popupContent: undefined,
      oldPassword: undefined,
      popupType: undefined,
      removeDevicesData: undefined
    };
    this.blurEmailRecovery = undefined;
    this.forgotPasswordStatus = undefined;
  }

  render() {
    const showFooter =
      this.state.currentStep === mode.SIGNIN ||
      this.state.currentStep === mode.SIGNINPASSWORD ||
      this.state.currentStep === mode.CHANGEPASSWORD;
    return (
      <div className="panel-wrapper">
        {this.renderPopup()}
        {this.renderHeader()}
        <section>{this.renderSection()}</section>
        {showFooter && this.renderFooter()}
      </div>
    );
  }

  /* eslint-disable jsx-a11y/anchor-is-valid */
  renderFooter = () => (
    <footer>
      <span>
        <a
          className="footer-link"
          href={this.state.contactURL}
          // eslint-disable-next-line react/jsx-no-target-blank
          target="_blank"
        >
          {help.contact_support}
        </a>
        &nbsp;&nbsp;&#8226;&nbsp;&nbsp;
        <a
          className="footer-link"
          // eslint-disable-next-line no-script-url
          href="javascript:;"
          onClick={this.handleCheckForUpdates}
        >
          {help.check_updates}
        </a>
        &nbsp;
      </span>
    </footer>
  );

  renderHeader = () => (
    <header className={this.defineHeaderClass()}>
      <div className="button-section">
        <button
          className="back-button"
          onClick={ev => this.onClickBackView(ev)}
        >
          <i className="icon-back" />
        </button>
      </div>
      <div className="criptext-logo">
        <div className="icon" />
      </div>
    </header>
  );

  renderPopup = () => {
    if (!this.state.popupType) {
      return null;
    }
    switch (this.state.popupType) {
      case popupType.WARNING_SIGNIN_WITH_OTHER_DEVICE:
        return (
          <SignInAnotherAccount
            {...this.state.popupContent}
            type={DialogTypes.SIGN_ANOTHER_ACCOUNT}
            onCancelClick={this.dismissPopup}
            onConfirmClick={this.handleConfirmSignInAnotherAccount}
          />
        );
      case popupType.DELETE_DEVICE:
        return (
          <DeleteDevicePopup
            emailAddress={this.state.values.usernameOrEmailAddress}
            setPopupContent={this.setPopupContent}
            onDismiss={this.dismissPopup}
            devicesDeleted={this.handleDevicesDeleted}
            {...this.state.removeDevicesData}
          />
        );
      case popupType.WARNING_SIGNIN_WITH_PASSWORD:
        return (
          <LoginWithPasswordPopup
            {...this.state.popupContent}
            onCancelClick={this.handleStayLinking}
            onConfirmClick={this.handleCancelLink}
          />
        );
      case popupType.FORGOT_PASSWORD:
        return (
          <ResetPasswordPopup
            {...this.state.popupContent}
            blurEmailRecovery={this.blurEmailRecovery}
            status={this.forgotPasswordStatus}
            onDismiss={this.dismissPopup}
          />
        );
      case popupType.WARNING_RECOVERY_EMAIL:
        return (
          <NoRecoverySignUpPopup
            {...this.state.popupContent}
            onCancelClick={this.dismissPopup}
            onConfirmClick={this.handleSignUpContinue}
          />
        );
      case popupType.TOO_MANY_REQUEST:
        return (
          <TooManyRequest
            {...this.state.popupContent}
            onConfirmClick={this.dismissPopup}
          />
        );
      case popupType.RECOVERY_CODE:
        return (
          <RecoveryCodePopup
            emailAddress={this.state.values.usernameOrEmailAddress}
            jwt={this.state.ephemeralToken}
            onDismiss={this.dismissPopup}
            onCodeValidationSuccess={this.handleCodeSuccess}
          />
        );
      case popupType.UPGRADE_PLUS:
        return (
          <UpgradePlusPopup
            onDismiss={this.showRemoveDevicesPopup}
            upgradeToPlus={this.handleUpgradeToPlus}
            maxDevices={this.state.removeDevicesData.maxDevices}
          />
        );
      default:
        return null;
    }
  };

  renderSection = () => {
    switch (this.state.currentStep) {
      case mode.SIGNUP:
        return (
          <SignUpWrapper
            checkAvailableUsername={checkAvailableUsername}
            onFormReady={this.onFormReady}
            onSubmitWithoutRecoveryEmail={this.onSubmitWithoutRecoveryEmail}
          />
        );
      case mode.SIGNINTOAPPROVE:
        return (
          <SignInToApprove
            onLeftButtonClick={this.handlePopupLeftButton}
            onRightButtonClick={this.handlePopupRightButton}
            popupContent={this.state.popupContent}
            disabledResendLoginRequest={this.state.disabledResendLoginRequest}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            onClickResendLoginRequest={this.handleClickResendLoginRequest}
            onClickUseRecoveryCode={this.handleClickUseRecoveryCode}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
          />
        );
      case mode.DEVICE_NOT_APPROVED:
        return (
          <DeviceNotApproved
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
            onClickUseRecoveryCode={this.handleClickUseRecoveryCode}
          />
        );
      case mode.SIGNINPASSWORD:
        return (
          <SignInPasswordWrapper
            cleanState={this.cleanState}
            dismissPopup={this.dismissPopup}
            goToWaitingApproval={this.goToWaitingApproval}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
            removeDevicesData={this.state.removeDevicesData}
            setPopupContent={this.setPopupContent}
            onGoToChangePassword={this.hangleGoToChangePassword}
            value={this.state.values.usernameOrEmailAddress}
          />
        );
      case mode.CHANGEPASSWORD:
        return (
          <ChangePasswordWrapper
            emailAddress={this.state.values.usernameOrEmailAddress}
            oldPassword={this.state.oldPassword}
            values={''}
            goBack={this.onClickBackView}
          />
        );
      case mode.SIGNIN:
      default:
        return (
          <SignIn
            buttonState={this.state.buttonSignInState}
            errorMessage={this.state.errorMessage}
            goToSignUp={this.goToSignUp}
            onClickSignIn={this.handleClickSignIn}
            onChangeField={this.handleChange}
            value={this.state.values.usernameOrEmailAddress}
          />
        );
    }
  };

  getRecipientIdFromUsernameOrEmail = () => {
    const usernameOrEmailAddress = this.state.values.usernameOrEmailAddress;
    return usernameOrEmailAddress.includes(`@${appDomain}`)
      ? usernameOrEmailAddress.split('@')[0]
      : usernameOrEmailAddress;
  };

  hangleGoToChangePassword = oldPassword => {
    this.setState(state => ({
      lastStep: state.lastStep.concat([mode.CHANGEPASSWORD]),
      currentStep: mode.CHANGEPASSWORD,
      oldPassword
    }));
  };

  onSubmitWithoutRecoveryEmail = validInputData => {
    const popUp = signUp.popUp.warningRecoveryEmail;
    this.setState({
      popupType: popupType.WARNING_RECOVERY_EMAIL,
      popupContent: {
        title: popUp.title,
        prefix: popUp.prefix,
        strong: popUp.strong,
        suffix: popUp.suffix,
        cancelButtonLabel: popUp.leftButtonLabel,
        confirmButtonLabel: popUp.rightButtonLabel,
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
    if (!inputData) {
      return;
    }
    this.setState(
      {
        popupContent: undefined,
        popupType: undefined
      },
      () => {
        commitNewUser(inputData);
      }
    );
  };

  handleConfirmSignInAnotherAccount = async () => {
    const nextMode = this.state.popupContent.successMode;
    this.dismissPopup();
    if (nextMode === mode.SIGNINTOAPPROVE) {
      this.setState({
        buttonSignInState: ButtonState.LOADING,
        removeDevicesData: undefined
      });
      await this.initLinkDevice(this.state.values.usernameOrEmailAddress);
      return;
    } else if (nextMode === mode.SIGNUP) {
      this.setState({
        lastStep: this.concat(this.state.lastStep, nextMode),
        currentStep: mode.SIGNUP
      });
    }
  };

  handleCodeSuccess = ({ deviceId, name, customerType }) => {
    const [
      username,
      domain = appDomain
    ] = this.state.values.usernameOrEmailAddress.split('@');
    const recipientId =
      domain === appDomain
        ? username
        : this.state.values.usernameOrEmailAddress;
    socketClient.disconnect();
    this.stopCountdown();
    openCreateKeysLoadingWindow({
      loadingType: 'signin',
      remoteData: {
        recipientId,
        deviceId,
        name,
        customerType
      }
    });
    closeLoginWindow({ forceClose: true });
  };

  onClickBackView = ev => {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (this.state.currentStep === mode.SIGNINTOAPPROVE) {
      socketClient.disconnect();
      this.sendLinkCancel();
      this.stopCountdown();
      if (this.state.popupType === popupType.RECOVERY_CODE) {
        this.dismissPopup();
      }
    }
    const tmplastStep = [...this.state.lastStep];
    const popStep = tmplastStep.pop();
    const checkStep = tmplastStep[tmplastStep.length - 1];
    if (
      (popStep === mode.SIGNINPASSWORD && checkStep === mode.SIGNINTOAPPROVE) ||
      (popStep === mode.SIGNINTOAPPROVE && checkStep === mode.SIGNINPASSWORD) ||
      popStep === mode.DEVICE_NOT_APPROVED
    ) {
      tmplastStep.pop();
      const checkOtherStep = tmplastStep[tmplastStep.length - 1];
      if (checkOtherStep === mode.SIGNINPASSWORD) tmplastStep.pop();
    }
    const lastStep = tmplastStep;
    const currentStep = tmplastStep[tmplastStep.length - 1];
    const state = { lastStep, currentStep };
    if (currentStep === mode.SIGNIN)
      state.buttonSignInState = ButtonState.DISABLED;
    this.setState(state, this.cleanState);
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
          return { errorMessage: '', buttonSignInState: ButtonState.ENABLED };

        case 400:
          return {
            errorMessage: errorMessages.EMAILADDRESS_NOT_EXISTS,
            buttonSignInState: ButtonState.DISABLED
          };
        default:
          return {
            errorMessage: errorMessages.STATUS_UNKNOWN + status,
            buttonSignInState: ButtonState.DISABLED
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
            errorMessage: errorMessages.USERNAME_NOT_EXISTS,
            buttonSignInState: ButtonState.DISABLED
          };
        case 422:
          return {
            errorMessage: errorMessages.USERNAME_INVALID,
            buttonSignInState: ButtonState.DISABLED
          };
        case 400: {
          const buttonSignInState =
            this.state.buttonSignInState === ButtonState.LOADING
              ? ButtonState.LOADING
              : ButtonState.ENABLED;
          return { errorMessage: '', buttonSignInState };
        }
        case 410: {
          return {
            errorMessage: errorMessages.USERNAME_NOT_AVAILABLE,
            buttonSignInState: ButtonState.DISABLED
          };
        }
        default:
          return {
            errorMessage: errorMessages.STATUS_UNKNOWN + status,
            buttonSignInState: ButtonState.DISABLED
          };
      }
    });
  };

  handleChange = event => {
    const usernameOrEmailAddress = event.target.value;
    if (!usernameOrEmailAddress) {
      return this.setState({
        buttonSignInState: ButtonState.DISABLED,
        errorMessage: '',
        values: {
          ...this.state.values,
          usernameOrEmailAddress: usernameOrEmailAddress
        }
      });
    }
    const isUsernameValid = validateUsername(usernameOrEmailAddress);
    const isEmailAddressValid = validateEmail(usernameOrEmailAddress);
    if (!isUsernameValid && !isEmailAddressValid) {
      return this.setState({
        buttonSignInState: ButtonState.DISABLED,
        errorMessage: errorMessages.USERNAME_EMAILADDRESS_INVALID,
        values: {
          ...this.state.values,
          usernameOrEmailAddress: usernameOrEmailAddress
        }
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
        if (externalDomains.includes(domain)) {
          return this.setState({
            buttonSignInState: ButtonState.DISABLED,
            errorMessage: errorMessages.EMAILADDRESS_NOT_VALID_CRIPTEXT,
            values: {
              ...this.state.values,
              usernameOrEmailAddress: usernameOrEmailAddress
            }
          });
        }
        canLogin({ username, domain }).then(
          this.handleCanLoginResponse(usernameOrEmailAddress)
        );
      }
    }, 300);

    this.setState({
      buttonSignInState: ButtonState.ENABLED,
      errorMessage: '',
      values: {
        ...this.state.values,
        usernameOrEmailAddress: usernameOrEmailAddress
      }
    });
  };

  handleClickSignIn = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      buttonSignInState: ButtonState.LOADING,
      removeDevicesData: undefined
    });
    const recipientId = this.getRecipientIdFromUsernameOrEmail();
    const [existsAccount] = await getAccountByParams({
      recipientId
    });
    if (!existsAccount) {
      const successMode = mode.SIGNINTOAPPROVE;
      const check = await this.checkLoggedOutAccounts(successMode);
      if (check) {
        await this.initLinkDevice(recipientId);
      }
    } else if (!existsAccount.isLoggedIn) {
      await this.initLinkDevice(recipientId);
    } else {
      this.setState({
        errorMessage: errorMessages.USERNAME_LOGGED_IN,
        buttonSignInState: ButtonState.DISABLED
      });
    }
  };

  checkLoggedOutAccounts = async successMode => {
    const loggedOutAccounts = await getAccountByParams({ deviceId: '' });
    if (!loggedOutAccounts.length) return true;
    this.setState({
      buttonSignInState: ButtonState.ENABLED,
      popupType: popupType.WARNING_SIGNIN_WITH_OTHER_DEVICE,
      popupContent: {
        title: signIn.loginNewAccount.title,
        prefix: signIn.loginNewAccount.prefix,
        list: this.formLoggedOutAccountsList(loggedOutAccounts),
        suffix: signIn.loginNewAccount.suffix,
        cancelButtonLabel: signIn.loginNewAccount.cancelButtonLabel,
        confirmButtonLabel: signIn.loginNewAccount.confirmButtonLabel,
        successMode
      }
    });
    return false;
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
    this.setState(state => ({
      buttonSignInState: ButtonState.ENABLED,
      currentStep: mode.SIGNINPASSWORD,
      lastStep: this.concat(state.lastStep, mode.SIGNINPASSWORD)
    }));
  };

  goToSignUp = async e => {
    e.preventDefault();
    e.stopPropagation();
    const successMode = mode.SIGNUP;
    const check = await this.checkLoggedOutAccounts(successMode);
    if (check === true) {
      this.setState(state => ({
        lastStep: this.concat(state.lastStep, mode.SIGNUP),
        currentStep: mode.SIGNUP
      }));
    }
  };

  goToWaitingApproval = password => {
    this.setState(
      state => ({
        lastStep: this.concat(state.lastStep, mode.SIGNINTOAPPROVE),
        currentStep: mode.SIGNINTOAPPROVE,
        values: { ...state.values, password }
      }),
      () => {
        this.initLinkDevice(this.state.values.usernameOrEmailAddress);
      }
    );
  };

  obtainEphemeralToken = async ({ username, domain }) => {
    const { status, body } = await linkBegin({ username, domain });
    if (status === 439) {
      this.setState(
        {
          removeDevicesData: {
            customerType: body.customerType,
            maxDevices: body.maxDevices,
            needsRemoveDevices: true
          }
        },
        () => {
          this.goToPasswordLogin();
        }
      );
    } else if (status === 400) {
      this.goToPasswordLogin();
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
      const { twoFactorAuth, token, customerType } = body;
      this.setState({
        ephemeralToken: token,
        hasTwoFactorAuth: !!twoFactorAuth,
        customerType
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
    } else if (!this.state.hasTwoFactorAuth && this.state.values.password) {
      this.requestLogin();
    } else if (this.state.ephemeralToken) {
      const response = await this.sendLoginConfirmationRequest(
        this.state.ephemeralToken
      );
      if (response) {
        this.setState(
          state => ({
            buttonSignInState: ButtonState.ENABLED,
            currentStep: mode.SIGNINTOAPPROVE,
            lastStep: this.concat(state.lastStep, mode.SIGNINTOAPPROVE)
          }),
          () => {
            const recipientId =
              domain === appDomain ? username : usernameOrEmailAddress;
            createTemporalAccount({ recipientId });
            socketClient.start(this.state.ephemeralToken);
            this.checkLinkStatus();
          }
        );
      } else {
        this.goToPasswordLogin();
      }
    }
  };

  concat = (array, item) => {
    const popItem = array[array.length - 1];
    if (popItem === item) return array;
    return array.concat([item]);
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

  sendLinkCancel = async () => {
    const [
      recipientId,
      domain = appDomain
    ] = this.state.values.usernameOrEmailAddress.split('@');
    try {
      await linkCancel({
        newDeviceData: {
          recipientId,
          domain
        },
        jwt: this.state.ephemeralToken
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  handleClickSignInWithPassword = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.stopCountdown();
    this.setState({
      popupType: popupType.WARNING_SIGNIN_WITH_PASSWORD,
      popupContent: {
        title: signIn.usePassword.title,
        prefix: signIn.usePassword.prefix,
        strong: signIn.usePassword.strong,
        suffix: signIn.usePassword.suffix,
        cancelButtonLabel: signIn.usePassword.leftButtonLabel,
        confirmButtonLabel: signIn.usePassword.rightButtonLabel
      }
    });
  };

  handleClickUseRecoveryCode = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.stopCountdown();
    this.setState({
      popupType: popupType.RECOVERY_CODE
    });
  };

  setPopupContent = (popup, data) => {
    switch (popup) {
      case popupType.FORGOT_PASSWORD:
        {
          const { blurEmailRecovery, status } = data;
          this.blurEmailRecovery = blurEmailRecovery;
          this.forgotPasswordStatus = status;
          this.setState({ popupType: popup });
        }
        break;
      case popupType.TOO_MANY_REQUEST:
        {
          const { tooManyRequests } = errors;
          this.setState({
            buttonSignInState: ButtonState.ENABLED,
            popupType: popup,
            popupContent: {
              title: tooManyRequests.name,
              prefix: tooManyRequests.description,
              confirmButtonLabel: tooManyRequests.button
            }
          });
        }
        break;
      case popupType.DELETE_DEVICE:
        {
          const popType =
            this.state.removeDevicesData.customerType === 1
              ? popup
              : popupType.UPGRADE_PLUS;
          this.setState({
            popupType: popType,
            removeDevicesData: {
              ...this.state.removeDevicesData,
              ...data
            }
          });
        }
        break;
      default:
        break;
    }
  };

  dismissPopup = () => {
    this.setState({
      buttonSignInState: ButtonState.ENABLED,
      popupContent: undefined,
      popupType: undefined
    });
  };

  showRemoveDevicesPopup = () => {
    this.setState({
      popupType: popupType.DELETE_DEVICE
    });
  };

  handleUpgradeToPlus = () => {
    upgradeToPlus(this.state.removeDevicesData.token);
    this.setState({
      popupType: popupType.DELETE_DEVICE
    });
  };

  handleStayLinking = () => {
    this.setState({ popupContent: undefined, popupType: undefined }, () => {
      this.checkLinkStatus();
    });
  };

  handleCancelLink = () => {
    socketClient.disconnect();
    this.setState(state => ({
      lastStep: this.concat(state.lastStep, mode.SIGNINPASSWORD),
      currentStep: mode.SIGNINPASSWORD,
      popupContent: undefined,
      popupType: undefined
    }));
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
          LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
          this.checkLinkStatus();
        } else {
          this.onClickBackView();
          LINK_STATUS_ATTEMPS = LINK_STATUS_RETRIES;
        }
      });
    } else {
      const recipientId = this.getRecipientIdFromUsernameOrEmail();
      const { status, body } = await linkStatus(recipientId);
      switch (status) {
        case rejectedDeviceStatus: {
          this.stopCountdown();
          socketClient.disconnect();
          this.setState(state => ({
            lastStep: this.concat(state.lastStep, mode.DEVICE_NOT_APPROVED),
            currentStep: mode.DEVICE_NOT_APPROVED
          }));
          return;
        }
        case approvedDeviceStastus: {
          this.stopCountdown();
          socketClient.disconnect();
          const remoteData = {
            ...body,
            recipientId: this.state.values.usernameOrEmailAddress,
            customerType: this.state.customerType
          };
          const hasPIN = hasPin();
          if (!hasPIN)
            await sendPin({
              pin: DEFAULT_PIN,
              shouldSave: false,
              shouldExport: false,
              shouldOnlySetPIN: true
            });
          openCreateKeysLoadingWindow({
            loadingType: 'link-new-device',
            shouldResetPIN: !hasPIN,
            remoteData
          });
          deleteTemporalAccount();
          closeLoginWindow({ forceClose: true });
          return;
        }
        default: {
          this.linkStatusTimeout = await setTimeout(
            this.checkLinkStatus,
            LINK_STATUS_DELAY
          );
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

  defineHeaderClass = () => {
    return this.state.lastStep[this.state.lastStep.length - 1] === mode.SIGNIN
      ? 'invisible'
      : 'visible';
  };

  handleDevicesDeleted = password => {
    this.setState(
      state => {
        return {
          buttonSignInState: ButtonState.LOADING,
          popupType: undefined,
          values: {
            ...state.values,
            password
          }
        };
      },
      () => {
        this.initLinkDevice(this.state.values.usernameOrEmailAddress);
      }
    );
  };

  requestLogin = async () => {
    const [
      username,
      domain = appDomain
    ] = this.state.values.usernameOrEmailAddress.split('@');
    const password = this.state.values.password;
    const hashedPassword = hashPassword(password);
    const submittedData = {
      username,
      domain,
      password: hashedPassword
    };
    const res = await login(submittedData);
    const { status, body } = res;
    const recipientId =
      domain === appDomain
        ? username
        : this.state.values.usernameOrEmailAddress;
    if (status === 200) {
      const { deviceId, name, customerType } = body;
      const hasPIN = hasPin();
      if (!hasPIN)
        await sendPin({
          pin: DEFAULT_PIN,
          shouldSave: false,
          shouldExport: false,
          shouldOnlySetPIN: true
        });
      openCreateKeysLoadingWindow({
        loadingType: 'signin',
        shouldResetPIN: !hasPIN,
        remoteData: {
          recipientId,
          deviceId,
          name,
          customerType
        }
      });
      closeLoginWindow({ forceClose: true });
    } else {
      const error = {
        name: string.errors.loginFailed.name,
        description: string.errors.loginFailed.description + status
      };
      throwError(error);
    }
  };

  handleCheckForUpdates = () => {
    checkForUpdates(true);
  };
}

export default PanelWrapper;
