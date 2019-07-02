import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { myAccount, requiredMinLength } from './../utils/electronInterface';
import {
  changePassword,
  changeRecoveryEmail,
  setReplyTo,
  setTwoFactorAuth
} from './../utils/ipc';
import {
  addEvent,
  Event,
  sendRecoveryEmailChangedSuccessMessage,
  sendRecoveryEmailChangedErrorMessage,
  sendRecoveryEmailLinkConfirmationSuccessMessage,
  sendRecoveryEmailLinkConfirmationErrorMessage,
  removeEvent
} from './../utils/electronEventInterface';
import SettingAccount from './SettingAccount';
import {
  sendChangePasswordErrorMessage,
  sendChangePasswordSuccessMessage,
  sendTwoFactorAuthenticationTurnedOffMessage,
  sendSetReplyToSuccessMessage,
  sendSetReplyToErrorMessage
} from '../utils/electronEventInterface';
import {
  validateRecoveryEmail,
  validatePassword,
  validateConfirmPassword
} from '../validators/validators';
import { hashPassword } from '../utils/hashUtils';
import {
  storeResendConfirmationTimestamp,
  getTwoFactorAuthStatus,
  setTwoFactorAuthStatus,
  getLastRecoveryEmail,
  getLastRecoveryEmailConfirmed,
  setLastRecoveryEmail,
  setLastRecoveryEmailConfirmed,
  setReadReceiptsStatus,
  getReadReceiptsStatus
} from '../utils/storage';
import { emailRegex } from '../utils/RegexUtils';
import string from './../lang';

const EDITING_MODES = {
  EDITING_NAME: 'editing-name',
  NONE: 'none'
};

const SETTINGS_POPUP_TYPES = {
  CHANGE_PASSWORD: 'change-password',
  LOGOUT: 'logout',
  CHANGE_RECOVERY_EMAIL: 'change-recovery-email',
  TWO_FACTOR_AUTH_ENABLED: 'two-factor-auth-enabled',
  DELETE_ACCOUNT: 'delete-account',
  NONE: 'none',
  MANUAL_SYNC: 'manual-sync',
  MANUAL_SYNC_DEVICE_AUTHENTICATION: 'manual-sync-device-authentication',
  SET_REPLY_TO: 'reply-to'
};

const changePasswordErrors = {
  LENGTH: `${string.errors.password.length.a} ${requiredMinLength.password} ${
    string.errors.password.length.b
  }`,
  MATCH: string.errors.password.match
};

const recoveryEmailErrors = {
  INVALID_EMAIL_ADDRESS: string.errors.email.invalid
};

const RESEND_CONFIRMATION_MINUTES_DELAY = 5;

/* eslint-disable-next-line react/no-deprecated */
class SettingAccountWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenSettingsPopup: true,
      settingsPopupType: SETTINGS_POPUP_TYPES.NONE,
      twoFactorParams: {
        twoFactorEnabled: props.twoFactorAuth,
        isLoading: true
      },
      changePasswordPopupParams: {
        isDisabledSubmitButton: true,
        confirmNewPasswordInput: {
          name: 'confirmNewPasswordInput',
          type: 'password',
          icon: 'icon-not-show',
          value: '',
          errorMessage: '',
          hasError: true
        },
        newPasswordInput: {
          name: 'newPasswordInput',
          type: 'password',
          icon: 'icon-not-show',
          value: '',
          errorMessage: '',
          hasError: true
        },
        oldPasswordInput: {
          name: 'oldPasswordInput',
          type: 'password',
          icon: 'icon-not-show',
          value: '',
          errorMessage: '',
          hasError: true
        }
      },
      recoveryEmailParams: {
        recoveryEmail: props.recoveryEmail,
        recoveryEmailConfirmed: props.recoveryEmailConfirmed,
        isLoading: true
      },
      replyToParams: {
        replyToEmail: props.replyToEmail,
        isLoading: true
      },
      changeRecoveryEmailPopupParams: {
        isDisabledSubmitButton: true,
        recoveryEmailInput: {
          name: 'recoveryEmailInput',
          type: 'text',
          icon: 'icon-not-show',
          value: '',
          errorMessage: '',
          hasError: true
        },
        recoveryEmailPasswordInput: {
          name: 'recoveryEmailPasswordInput',
          type: 'password',
          icon: 'icon-not-show',
          value: '',
          errorMessage: '',
          hasError: true
        }
      },
      setReplyToPopupParams: {
        isDisabledSubmitButton: true,
        replyToInput: {
          email: '',
          hasError: false,
          errorMessage: ''
        }
      },
      readReceipts: {
        enabled: props.readReceiptsEnabled,
        isLoading: true
      },
      encryptToExternals: {
        enabled: myAccount.encryptToExternals,
        isLoading: false
      }
    };
    this.initEventHandlers();
  }

  render() {
    const devicesQuantity = this.props.devices ? this.props.devices.length : 0;
    return (
      <SettingAccount
        changePasswordPopupParams={this.state.changePasswordPopupParams}
        changeRecoveryEmailPopupParams={
          this.state.changeRecoveryEmailPopupParams
        }
        isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
        onChangeInputValueOnSetReplyTo={
          this.handleChangeInputValueOnSetReplyPopup
        }
        onClearPopupParams={this.handleClearPopupParams}
        onClickSetReplyTo={this.handleClickSetReplyTo}
        onClosePopup={this.handleClosePopup}
        onConfirmChangePassword={this.handleConfirmChangePassword}
        onConfirmChangeRecoveryEmail={this.handleConfirmChangeRecoveryEmail}
        onConfirmSetReplyTo={this.handleConfirmSetReplyTo}
        onRemoveReplyTo={this.handleRemoveReplyTo}
        replyToEmail={this.state.replyToParams.replyToEmail}
        replyToIsLoading={this.state.replyToParams.isLoading}
        setReplyToPopupParams={this.state.setReplyToPopupParams}
        onBlurInputRecoveryEmail={this.handleBlurInputRecoveryEmail}
        onChangeInputRecoveryEmail={this.handleChangeInputRecoveryEmail}
        onChangeInputValueChangePassword={
          this.handleChangeInputValueOnChangePasswordPopup
        }
        onClickChangePasswordButton={this.handleClickChangePasswordButton}
        onClickChangePasswordInputType={this.handleClickChangePasswordInputType}
        onClickChangeRecoveryEmail={this.handleClickChangeRecoveryEmail}
        recoveryEmail={this.state.recoveryEmailParams.recoveryEmail}
        recoveryEmailConfirmed={
          this.state.recoveryEmailParams.recoveryEmailConfirmed
        }
        recoveryEmailIsLoading={this.state.recoveryEmailParams.isLoading}
        onClickResendConfirmationLink={this.handleClickResendConfirmationLink}
        onResendConfirmationCountdownEnd={
          this.handleResendConfirmationCountdownEnd
        }
        settingsPopupType={this.state.settingsPopupType}
        twoFactorEnabled={this.state.twoFactorParams.twoFactorEnabled}
        twoFactorLabelIsLoading={this.state.twoFactorParams.isLoading}
        onChangeSwitchTwoFactor={this.handleChangeSwitchTwoFactor}
        onChangeInputValueOnChangeRecoveryEmailPopup={
          this.handleChangeInputValueOnChangeRecoveryEmailPopup
        }
        onClickChangeRecoveryEmailInputType={
          this.handleClickChangeRecoveryEmailInputType
        }
        onClickForgotPasswordLink={this.handleClickForgotPasswordLink}
        encryptToExternalsisLoading={this.state.encryptToExternals.isLoading}
        encryptToExternalsEnabled={!!this.state.encryptToExternals.enabled}
        onChangeSwitchEncryptToExternals={
          this.handleChangeSwitchEncryptToExternals
        }
        onChangeSwitchReadReceipts={this.handleChangeSwitchReadReceipts}
        readReceiptsEnabled={this.state.readReceipts.enabled}
        readReceiptsLabelisLoading={this.state.readReceipts.isLoading}
        onShowSettingsPopup={this.handleShowSettingsPopup}
        devicesQuantity={devicesQuantity}
      />
    );
  }

  componentDidMount() {
    setTimeout(() => {
      const stillTwoFactorAuthLoading = this.state.twoFactorParams.isLoading;
      const stillRecoveryEmailLoading = this.state.recoveryEmailParams
        .isLoading;
      const stillReadReceiptsLoading = this.state.readReceipts.isLoading;
      const stillReplyToLoading = this.state.replyToParams.isLoading;
      if (
        stillTwoFactorAuthLoading ||
        stillRecoveryEmailLoading ||
        stillReadReceiptsLoading ||
        stillReplyToLoading
      ) {
        this.setState({
          twoFactorParams: {
            ...this.state.twoFactorParams,
            twoFactorEnabled: getTwoFactorAuthStatus() === 'true',
            isLoading: false
          },
          recoveryEmailParams: {
            ...this.state.recoveryEmailParams,
            recoveryEmail: getLastRecoveryEmail(),
            recoveryEmailConfirmed: getLastRecoveryEmailConfirmed() === 'true',
            isLoading: false
          },
          readReceipts: {
            ...this.state.readReceipts,
            enabled: getReadReceiptsStatus() === 'true',
            isLoading: false
          },
          replyToParams: {
            ...this.state.replyToParams,
            isLoading: false
          }
        });
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    const newRecoveryEmailParams = {};
    const newTwoFactorParams = {};
    const newReadReceipts = {};
    const newReplyToParams = {};
    const popupParams = {};
    if (
      nextProps.recoveryEmail &&
      this.state.recoveryEmail !== nextProps.recoveryEmail
    ) {
      newRecoveryEmailParams.recoveryEmail = nextProps.recoveryEmail;
      setLastRecoveryEmail(nextProps.recoveryEmail);
    }
    if (
      this.state.recoveryEmailConfirmed !== nextProps.recoveryEmailConfirmed
    ) {
      newRecoveryEmailParams.recoveryEmailConfirmed =
        nextProps.recoveryEmailConfirmed;
      setLastRecoveryEmailConfirmed(nextProps.recoveryEmailConfirmed);
    }
    if (
      this.state.twoFactorParams.twoFactorEnabled !== nextProps.twoFactorAuth
    ) {
      newTwoFactorParams.twoFactorEnabled = nextProps.twoFactorAuth;
      newTwoFactorParams.isLoading = false;
      setTwoFactorAuthStatus(nextProps.twoFactorAuth);
    }
    if (
      nextProps.readReceiptsEnabled &&
      this.state.readReceipts.enabled !== nextProps.readReceiptsEnabled
    ) {
      newReadReceipts.enabled = nextProps.readReceiptsEnabled;
      setReadReceiptsStatus(nextProps.readReceiptsEnabled);
    }
    if (this.state.replyToParams.replyToEmail !== nextProps.replyToEmail) {
      newReplyToParams.replyToEmail = nextProps.replyToEmail;
      newReplyToParams.isLoading = false;
      popupParams.email = nextProps.replyToEmail;
    }
    this.setState({
      recoveryEmailParams: {
        ...this.state.recoveryEmailParams,
        ...newRecoveryEmailParams
      },
      twoFactorParams: {
        ...this.state.twoFactorParams,
        ...newTwoFactorParams
      },
      readReceipts: {
        ...this.state.readReceipts,
        ...newReadReceipts
      },
      replyToParams: {
        ...this.state.replyToParams,
        ...newReplyToParams
      },
      setReplyToPopupParams: {
        isDisabledSubmitButton: this.state.setReplyToPopupParams
          .isDisabledSubmitButton,
        replyToInput: {
          ...this.state.setReplyToPopupParams.replyToInput,
          ...popupParams
        }
      }
    });
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  handleClearPopupParams = popupType => {
    let newState = {};
    switch (popupType) {
      case SETTINGS_POPUP_TYPES.CHANGE_PASSWORD: {
        newState = {
          changePasswordPopupParams: {
            isDisabledSubmitButton: true,
            confirmNewPasswordInput: {
              name: 'confirmNewPasswordInput',
              type: 'password',
              icon: 'icon-not-show',
              value: '',
              errorMessage: '',
              hasError: true
            },
            newPasswordInput: {
              name: 'newPasswordInput',
              type: 'password',
              icon: 'icon-not-show',
              value: '',
              errorMessage: '',
              hasError: true
            },
            oldPasswordInput: {
              name: 'oldPasswordInput',
              type: 'password',
              icon: 'icon-not-show',
              value: '',
              errorMessage: '',
              hasError: true
            }
          }
        };
        break;
      }
      case SETTINGS_POPUP_TYPES.SET_REPLY_TO: {
        newState = {
          setReplyToPopupParams: {
            isDisabledSubmitButton: true,
            replyToInput: {
              email: this.state.replyToParams.replyToEmail,
              hasError: false,
              errorMessage: ''
            }
          }
        };
        break;
      }
      case SETTINGS_POPUP_TYPES.CHANGE_RECOVERY_EMAIL: {
        newState = {
          changeRecoveryEmailPopupParams: {
            isDisabledSubmitButton: true,
            recoveryEmailInput: {
              name: 'recoveryEmailInput',
              type: 'text',
              icon: 'icon-not-show',
              value: '',
              errorMessage: '',
              hasError: true
            },
            recoveryEmailPasswordInput: {
              name: 'recoveryEmailPasswordInput',
              type: 'password',
              icon: 'icon-not-show',
              value: '',
              errorMessage: '',
              hasError: true
            }
          }
        };
        break;
      }
      default:
        newState = {};
        break;
    }
    this.setState(newState);
  };

  handleClickChangePasswordButton = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPopupType: SETTINGS_POPUP_TYPES.CHANGE_PASSWORD
    });
  };

  handleClickChangeRecoveryEmail = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPopupType: SETTINGS_POPUP_TYPES.CHANGE_RECOVERY_EMAIL
    });
  };

  handleClickSetReplyTo = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPopupType: SETTINGS_POPUP_TYPES.SET_REPLY_TO
    });
  };

  handleClickResendConfirmationLink = async () => {
    try {
      const { status } = await this.props.onResendConfirmationEmail();
      if (status === 200) {
        const resendCountdown =
          Date.now() + RESEND_CONFIRMATION_MINUTES_DELAY * 60 * 1000;
        storeResendConfirmationTimestamp(resendCountdown);
        this.forceUpdate();
        sendRecoveryEmailLinkConfirmationSuccessMessage();
      } else {
        sendRecoveryEmailLinkConfirmationErrorMessage();
      }
    } catch (e) {
      sendRecoveryEmailLinkConfirmationErrorMessage();
    }
  };

  handleResendConfirmationCountdownEnd = () => {
    storeResendConfirmationTimestamp(null);
  };

  handleChangeInputValueOnChangePasswordPopup = ev => {
    const value = ev.target.value.trim();
    const name = ev.target.getAttribute('name');
    const { hasError, errorMessage } = this.checkInputError(name, value);
    const changePasswordPopupParams = {
      ...this.state.changePasswordPopupParams,
      [name]: {
        ...this.state.changePasswordPopupParams[name],
        value,
        hasError,
        errorMessage
      }
    };
    this.setState({ changePasswordPopupParams }, () => {
      this.checkDisabledChangePasswordButton();
    });
  };

  handleChangeSwitchTwoFactor = ev => {
    const nextValue = ev.target.checked;
    this.setState(
      {
        twoFactorParams: {
          ...this.state.twoFactorParams,
          isLoading: true
        }
      },
      async () => {
        const { status } = await setTwoFactorAuth(nextValue);
        const twoFactorParams = {
          ...this.state.twoFactorParams
        };
        if (status === 200) {
          let newState;
          twoFactorParams['twoFactorEnabled'] = nextValue;
          twoFactorParams['isLoading'] = false;
          if (nextValue === true) {
            newState = {
              ...newState,
              isHiddenSettingsPopup: false,
              settingsPopupType: SETTINGS_POPUP_TYPES.TWO_FACTOR_AUTH_ENABLED
            };
          } else {
            sendTwoFactorAuthenticationTurnedOffMessage();
          }
          newState = {
            ...newState,
            twoFactorParams
          };
          this.setState(newState);
          setTwoFactorAuthStatus(nextValue);
        } else {
          twoFactorParams['isLoading'] = false;
          this.setState({ twoFactorParams });
        }
      }
    );
  };

  handleChangeInputValueOnSetReplyPopup = ev => {
    const value = ev.target.value.trim();
    const isValidEmailAddress = emailRegex.test(value);
    const newParams = {
      ...this.state.setReplyToPopupParams,
      isDisabledSubmitButton: !isValidEmailAddress,
      replyToInput: {
        email: value,
        hasError: !isValidEmailAddress,
        errorMessage: isValidEmailAddress
          ? ''
          : string.popups.set_reply_to.errors.email
      }
    };
    this.setState({
      setReplyToPopupParams: newParams
    });
  };

  handleChangeInputValueOnChangeRecoveryEmailPopup = ev => {
    const value = ev.target.value.trim();
    const name = ev.target.getAttribute('name');
    const { hasError, errorMessage } = this.checkInputError(name, value);
    const changeRecoveryEmailPopupParams = {
      ...this.state.changeRecoveryEmailPopupParams,
      [name]: {
        ...this.state.changeRecoveryEmailPopupParams[name],
        value,
        hasError,
        errorMessage
      }
    };
    this.setState({ changeRecoveryEmailPopupParams }, () => {
      this.checkDisabledRecoveryEmailPopupButton();
    });
  };

  checkInputError = (name, value) => {
    switch (name) {
      case 'oldPasswordInput': {
        const isValid = validatePassword(value);
        const errorMessage = changePasswordErrors.LENGTH;
        return { hasError: !isValid, errorMessage };
      }
      case 'newPasswordInput': {
        const isValid = validatePassword(value);
        const errorMessage = changePasswordErrors.LENGTH;
        return { hasError: !isValid, errorMessage };
      }
      case 'confirmNewPasswordInput': {
        const isValid = validatePassword(value);
        if (!isValid) {
          return {
            hasError: true,
            errorMessage: changePasswordErrors.LENGTH
          };
        }
        const isMatched = validateConfirmPassword(
          this.state.changePasswordPopupParams.newPasswordInput.value,
          value
        );
        const errorMessage = changePasswordErrors.MATCH;
        return { hasError: !isMatched, errorMessage };
      }
      case 'recoveryEmailInput': {
        const isValid = validateRecoveryEmail(value);
        const errorMessage = recoveryEmailErrors.INVALID_EMAIL_ADDRESS;
        return { hasError: !isValid, errorMessage };
      }
      case 'recoveryEmailPasswordInput': {
        const isValid = validatePassword(value);
        const errorMessage = changePasswordErrors.LENGTH;
        return { hasError: !isValid, errorMessage };
      }
      default:
        break;
    }
  };

  checkDisabledChangePasswordButton = () => {
    const isDisabled =
      this.state.changePasswordPopupParams.oldPasswordInput.hasError ||
      this.state.changePasswordPopupParams.newPasswordInput.hasError ||
      this.state.changePasswordPopupParams.confirmNewPasswordInput.hasError;
    const changePasswordPopupParams = {
      ...this.state.changePasswordPopupParams,
      isDisabledSubmitButton: isDisabled
    };
    this.setState({ changePasswordPopupParams });
  };

  checkDisabledRecoveryEmailPopupButton = () => {
    const isDisabled =
      this.state.changeRecoveryEmailPopupParams.recoveryEmailInput.hasError ||
      this.state.changeRecoveryEmailPopupParams.recoveryEmailPasswordInput
        .hasError;
    const changeRecoveryEmailPopupParams = {
      ...this.state.changeRecoveryEmailPopupParams,
      isDisabledSubmitButton: isDisabled
    };
    this.setState({ changeRecoveryEmailPopupParams });
  };

  handleClickChangePasswordInputType = name => {
    const [type, icon] =
      this.state.changePasswordPopupParams[name].type === 'password'
        ? ['text', 'icon-show']
        : ['password', 'icon-not-show'];

    const changePasswordPopupParams = {
      ...this.state.changePasswordPopupParams,
      [name]: {
        ...this.state.changePasswordPopupParams[name],
        type,
        icon
      }
    };
    this.setState({ changePasswordPopupParams });
  };

  handleClickChangeRecoveryEmailInputType = name => {
    const [type, icon] =
      this.state.changeRecoveryEmailPopupParams[name].type === 'password'
        ? ['text', 'icon-show']
        : ['password', 'icon-not-show'];

    const changeRecoveryEmailPopupParams = {
      ...this.state.changeRecoveryEmailPopupParams,
      [name]: {
        ...this.state.changeRecoveryEmailPopupParams[name],
        type,
        icon
      }
    };
    this.setState({ changeRecoveryEmailPopupParams });
  };

  handleConfirmChangePassword = async () => {
    const params = {
      oldPassword: hashPassword(
        this.state.changePasswordPopupParams.oldPasswordInput.value
      ),
      newPassword: hashPassword(
        this.state.changePasswordPopupParams.newPasswordInput.value
      )
    };
    const { status } = await changePassword(params);
    if (status === 400) {
      const changePasswordPopupParams = {
        ...this.state.changePasswordPopupParams,
        oldPasswordInput: {
          ...this.state.changePasswordPopupParams.oldPasswordInput,
          hasError: true,
          errorMessage: 'Wrong password'
        }
      };
      return this.setState({ changePasswordPopupParams });
    }
    if (status === 200) {
      sendChangePasswordSuccessMessage();
      this.handleClosePopup();
      this.handleClearPopupParams(SETTINGS_POPUP_TYPES.CHANGE_PASSWORD);
      return;
    }
    sendChangePasswordErrorMessage();
  };

  handleConfirmSetReplyTo = async () => {
    const email = this.state.setReplyToPopupParams.replyToInput.email;
    const SUCCESS_STATUS = 200;

    const { status } = await setReplyTo({
      enable: true,
      address: email
    });

    if (status === SUCCESS_STATUS) {
      this.setState(
        {
          isHiddenSettingsPopup: true,
          settingsPopupType: SETTINGS_POPUP_TYPES.NONE,
          replyToParams: {
            isLoading: false,
            replyToEmail: email
          },
          setReplyToPopupParams: {
            isDisabledSubmitButton: true,
            replyToInput: {
              email: email,
              hasError: false,
              errorMessage: ''
            }
          }
        },
        () => {
          sendSetReplyToSuccessMessage();
        }
      );
    } else {
      this.setState(
        {
          isHiddenSettingsPopup: true,
          settingsPopupType: SETTINGS_POPUP_TYPES.NONE,
          setReplyToPopupParams: {
            isDisabledSubmitButton: true,
            replyToInput: {
              email: this.state.replyToParams.replyToEmail,
              hasError: false,
              errorMessage: ''
            }
          }
        },
        () => {
          sendSetReplyToErrorMessage();
        }
      );
    }
  };

  handleRemoveReplyTo = () => {
    this.setState(
      {
        replyToParams: {
          ...this.state.replyToParams,
          isLoading: true
        }
      },
      this.handleRemoveReplyToRequest
    );
  };

  handleRemoveReplyToRequest = async () => {
    const SUCCESS_STATUS = 200;
    const { status } = await setReplyTo({
      enable: false,
      address: this.state.replyToParams.replyToEmail
    });
    if (status === SUCCESS_STATUS) {
      this.setState(
        {
          replyToParams: {
            isLoading: false,
            replyToEmail: ''
          },
          setReplyToPopupParams: {
            isDisabledSubmitButton: true,
            replyToInput: {
              email: '',
              hasError: false,
              errorMessage: ''
            }
          }
        },
        () => {
          sendSetReplyToSuccessMessage();
        }
      );
    } else {
      this.setState(
        {
          replyToParams: {
            ...this.state.replyToParams,
            isLoading: false
          },
          setReplyToPopupParams: {
            isDisabledSubmitButton: true,
            replyToInput: {
              email: this.state.replyToParams.replyToEmail,
              hasError: false,
              errorMessage: ''
            }
          }
        },
        () => {
          sendSetReplyToErrorMessage();
        }
      );
    }
  };

  handleConfirmChangeRecoveryEmail = async () => {
    const email = this.state.changeRecoveryEmailPopupParams.recoveryEmailInput
      .value;
    const params = {
      email,
      password: hashPassword(
        this.state.changeRecoveryEmailPopupParams.recoveryEmailPasswordInput
          .value
      )
    };
    const REPEATED_RECOVERY_EMAIL = 405;
    const WRONG_PASSWORD_STATUS = 400;
    const INVALID_EMAIL_STATUS = 422;
    const SUCCESS_STATUS = 200;
    let errorMessage = '';
    let inputName = '';

    const { status } = await changeRecoveryEmail(params);
    if (status === SUCCESS_STATUS) {
      return this.setState(
        {
          recoveryEmailParams: {
            recoveryEmail: email,
            recoveryEmailConfirmed: false
          }
        },
        () => {
          sendRecoveryEmailChangedSuccessMessage();
          this.handleClosePopup();
          this.handleClearPopupParams(
            SETTINGS_POPUP_TYPES.CHANGE_RECOVERY_EMAIL
          );
        }
      );
    }
    if (status === WRONG_PASSWORD_STATUS) {
      errorMessage = 'Wrong password';
      inputName = 'recoveryEmailPasswordInput';
    }
    if (status === INVALID_EMAIL_STATUS) {
      errorMessage = 'Invalid email';
      inputName = 'recoveryEmailInput';
    }
    if (status === REPEATED_RECOVERY_EMAIL) {
      errorMessage = 'This is the current recovery email';
      inputName = 'recoveryEmailInput';
    }
    const changeRecoveryEmailPopupParams = {
      ...this.state.changeRecoveryEmailPopupParams,
      [inputName]: {
        ...this.state.changeRecoveryEmailPopupParams[inputName],
        hasError: true,
        errorMessage
      }
    };
    this.setState({ changeRecoveryEmailPopupParams });
    sendRecoveryEmailChangedErrorMessage();
  };

  handleClickForgotPasswordLink = () => {
    this.setState(
      {
        isHiddenSettingsPopup: false,
        settingsPopupType: SETTINGS_POPUP_TYPES.NONE
      },
      () => {
        this.props.onResetPassword();
      }
    );
  };

  handleChangeSwitchReadReceipts = ev => {
    const prevValue = this.state.readReceipts.enabled;
    const nextValue = ev.target.checked;
    this.setState(
      {
        readReceipts: {
          ...this.state.readReceipts,
          isLoading: true
        }
      },
      async () => {
        const status = await this.props.onSetReadReceiptsTracking(nextValue);
        let enabled;
        if (status === 200) {
          enabled = nextValue;
          setReadReceiptsStatus(nextValue);
        } else {
          enabled = prevValue;
        }
        this.setState({
          readReceipts: {
            enabled,
            isLoading: false
          }
        });
      }
    );
  };

  handleChangeSwitchEncryptToExternals = ev => {
    const nextValue = ev.target.checked;
    this.setState(
      {
        encryptToExternals: {
          ...this.state.encryptToExternals,
          isLoading: true
        }
      },
      async () => {
        await this.props.onUpdateAccount({ encryptToExternals: nextValue });
        this.setState({
          encryptToExternals: {
            enabled: nextValue,
            isLoading: false
          }
        });
      }
    );
  };

  handleShowSettingsPopup = popupType => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPopupType: popupType
    });
  };

  handleClosePopup = () => {
    this.setState({
      isHiddenSettingsPopup: true,
      settingsPopupType: SETTINGS_POPUP_TYPES.NONE
    });
  };

  initEventHandlers = () => {
    addEvent(
      Event.RECOVERY_EMAIL_CHANGED,
      this.recoveryEmailChangedListenerCallback
    );
    addEvent(
      Event.RECOVERY_EMAIL_CONFIRMED,
      this.recoveryEmailConfirmedListenerCallback
    );
  };

  removeEventHandlers = () => {
    removeEvent(
      Event.RECOVERY_EMAIL_CHANGED,
      this.recoveryEmailChangedListenerCallback
    );
    removeEvent(
      Event.RECOVERY_EMAIL_CONFIRMED,
      this.recoveryEmailConfirmedListenerCallback
    );
  };

  recoveryEmailChangedListenerCallback = recoveryEmail => {
    this.setState({
      recoveryEmailParams: {
        recoveryEmail: recoveryEmail,
        recoveryEmailConfirmed: false
      }
    });
  };

  recoveryEmailConfirmedListenerCallback = () => {
    this.setState({
      recoveryEmailParams: {
        ...this.state.recoveryEmailParams,
        recoveryEmailConfirmed: true
      }
    });
  };
}

SettingAccountWrapper.propTypes = {
  devices: PropTypes.array,
  isHiddenSettingsPopup: PropTypes.bool,
  onDeleteDeviceData: PropTypes.func,
  onResendConfirmationEmail: PropTypes.func,
  onResetPassword: PropTypes.func,
  onSetReadReceiptsTracking: PropTypes.func,
  onUpdateAccount: PropTypes.func,
  readReceiptsEnabled: PropTypes.bool,
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  replyToEmail: PropTypes.string,
  twoFactorAuth: PropTypes.bool
};

export {
  SettingAccountWrapper as default,
  EDITING_MODES,
  SETTINGS_POPUP_TYPES
};
