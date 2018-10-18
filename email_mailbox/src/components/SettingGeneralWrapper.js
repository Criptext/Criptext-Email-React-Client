import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  myAccount,
  requiredMinLength,
  changePassword,
  changeRecoveryEmail,
  setTwoFactorAuth
} from './../utils/electronInterface';
import {
  addEvent,
  Event,
  sendRecoveryEmailChangedSuccessMessage,
  sendRecoveryEmailChangedErrorMessage,
  sendRecoveryEmailLinkConfirmationSuccessMessage,
  sendRecoveryEmailLinkConfirmationErrorMessage
} from './../utils/electronEventInterface';
import SettingGeneral from './SettingGeneral';
import { EditorState } from 'draft-js';
import {
  parseSignatureContentToHtml,
  parseSignatureHtmlToEdit
} from '../utils/EmailUtils';
import {
  sendRemoveDeviceErrorMessage,
  sendChangePasswordErrorMessage,
  sendChangePasswordSuccessMessage
} from '../utils/electronEventInterface';
import {
  validateRecoveryEmail,
  validateFullname,
  validatePassword,
  validateConfirmPassword
} from '../validators/validators';
import { hashPassword } from '../utils/hashUtils';
import {
  storeResendConfirmationTimestamp,
  getTwoFactorAuthStatus,
  setTwoFactorAuthStatus
} from '../utils/storage';

const EDITING_MODES = {
  EDITING_NAME: 'editing-name',
  NONE: 'none'
};

const SETTINGS_POPUP_TYPES = {
  CHANGE_PASSWORD: 'change-password',
  LOGOUT: 'logout',
  CHANGE_RECOVERY_EMAIL: 'change-recovery-email',
  NONE: 'none'
};

const changePasswordErrors = {
  LENGTH: `Must be at least ${requiredMinLength.password} characters`,
  MATCH: 'Passwords do not match'
};

const recoveryEmailErrors = {
  INVALID_EMAIL_ADDRESS: 'Invalid email'
};

const RESEND_CONFIRMATION_MINUTES_DELAY = 5;

/* eslint-disable-next-line react/no-deprecated */
class SettingGeneralWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: EDITING_MODES.NONE,
      isHiddenSettingsPopup: true,
      settingsPupopType: SETTINGS_POPUP_TYPES.NONE,
      nameParams: {
        name: myAccount.name
      },
      signatureParams: {
        signature: EditorState.createEmpty(),
        signatureEnabled: undefined
      },
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
        recoveryEmailConfirmed: props.recoveryEmailConfirmed
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
      }
    };
    this.initEventHandlers();
  }

  render() {
    return (
      <SettingGeneral
        isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
        name={this.state.nameParams.name}
        recoveryEmailPopupInputEmail={
          this.state.changeRecoveryEmailPopupParams.recoveryEmailInput
        }
        recoveryEmailPopupInputPassword={
          this.state.changeRecoveryEmailPopupParams.recoveryEmailPasswordInput
        }
        oldPasswordInput={this.state.changePasswordPopupParams.oldPasswordInput}
        newPasswordInput={this.state.changePasswordPopupParams.newPasswordInput}
        confirmNewPasswordInput={
          this.state.changePasswordPopupParams.confirmNewPasswordInput
        }
        isDisabledChangePasswordSubmitButton={
          this.state.changePasswordPopupParams.isDisabledSubmitButton
        }
        isDisabledChangeRecoveryEmailSubmitButton={
          this.state.changeRecoveryEmailPopupParams.isDisabledSubmitButton
        }
        mode={this.state.mode}
        onAddNameInputKeyPressed={this.handleAddNameInputKeyPressed}
        onAddRecoveryEmailInputKeyPressed={
          this.handleAddRecoveryEmailInputKeyPressed
        }
        onBlurInputName={this.handleBlurInputName}
        onBlurInputRecoveryEmail={this.handleBlurInputRecoveryEmail}
        onChangeInputName={this.handleChangeInputName}
        onChangeInputRecoveryEmail={this.handleChangeInputRecoveryEmail}
        onChangeInputValueChangePassword={
          this.handleChangeInputValueOnChangePasswordPopup
        }
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onClickCancelChangePassword={this.handleClickCancelChangePassword}
        onClickCancelChangeRecoveryEmail={
          this.handleClickCancelChangeRecoveryEmail
        }
        onClickCancelLogout={this.handleClickCancelLogout}
        onClickChangePasswordButton={this.handleClickChangePasswordButton}
        onClickChangePasswordInputType={this.handleClickChangePasswordInputType}
        onClickEditName={this.handleClickEditName}
        onClickChangeRecoveryEmail={this.handleClickChangeRecoveryEmail}
        onClickLogout={this.handleClickLogout}
        onConfirmChangePassword={this.handleConfirmChangePassword}
        onConfirmChangeRecoveryEmail={this.handleConfirmChangeRecoveryEmail}
        onConfirmLogout={this.handleConfirmLogout}
        recoveryEmail={this.state.recoveryEmailParams.recoveryEmail}
        recoveryEmailConfirmed={
          this.state.recoveryEmailParams.recoveryEmailConfirmed
        }
        onClickResendConfirmationLink={this.handleClickResendConfirmationLink}
        onResendConfirmationCountdownEnd={
          this.handleResendConfirmationCountdownEnd
        }
        settingsPupopType={this.state.settingsPupopType}
        signatureEnabled={this.state.signatureParams.signatureEnabled}
        signature={this.state.signatureParams.signature}
        twoFactorEnabled={this.state.twoFactorParams.twoFactorEnabled}
        twoFactorLabelIsLoading={this.state.twoFactorParams.isLoading}
        onChangeSwitchTwoFactor={this.handleChangeSwitchTwoFactor}
        onChangeInputValueOnChangeRecoveryEmailPopup={
          this.handleChangeInputValueOnChangeRecoveryEmailPopup
        }
        onClickChangeRecoveryEmailInputType={
          this.handleClickChangeRecoveryEmailInputType
        }
      />
    );
  }

  componentWillMount() {
    const signatureParams = {
      signature: parseSignatureHtmlToEdit(myAccount.signature),
      signatureEnabled: !!myAccount.signatureEnabled
    };
    this.setState({ signatureParams });
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.state.twoFactorParams.isLoading) {
        this.setState({
          twoFactorParams: {
            ...this.state.twoFactorParams,
            twoFactorEnabled: getTwoFactorAuthStatus() === 'true',
            isLoading: false
          }
        });
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    const newRecoveryEmailParams = {};
    const newTwoFactorParams = {};
    if (
      nextProps.recoveryEmail &&
      this.state.recoveryEmail !== nextProps.recoveryEmail
    ) {
      newRecoveryEmailParams.recoveryEmail = nextProps.recoveryEmail;
    }
    if (
      this.state.recoveryEmailConfirmed !== nextProps.recoveryEmailConfirmed
    ) {
      newRecoveryEmailParams.recoveryEmailConfirmed =
        nextProps.recoveryEmailConfirmed;
    }
    if (
      this.state.twoFactorParams.twoFactorEnabled !== nextProps.twoFactorAuth
    ) {
      newTwoFactorParams.twoFactorEnabled = nextProps.twoFactorAuth;
      newTwoFactorParams.isLoading = false;
      setTwoFactorAuthStatus(nextProps.twoFactorAuth);
    }
    this.setState({
      recoveryEmailParams: {
        ...this.state.recoveryEmailParams,
        ...newRecoveryEmailParams
      },
      twoFactorParams: {
        ...this.state.twoFactorParams,
        ...newTwoFactorParams
      }
    });
  }

  handleBlurInputName = e => {
    const currentTarget = e.currentTarget;
    if (!currentTarget.contains(document.activeElement)) {
      const nameParams = { name: myAccount.name };
      this.setState({
        mode: EDITING_MODES.NONE,
        nameParams
      });
    }
  };

  handleClickCancelChangePassword = () => {
    this.setState({
      isHiddenSettingsPopup: true,
      settingsPupopType: SETTINGS_POPUP_TYPES.NONE,
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
    });
  };

  handleClickCancelChangeRecoveryEmail = () => {
    this.setState({
      isHiddenSettingsPopup: true,
      settingsPupopType: SETTINGS_POPUP_TYPES.NONE,
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
    });
  };

  handleClickCancelLogout = () => {
    this.setState({
      isHiddenSettingsPopup: true,
      settingsPupopType: SETTINGS_POPUP_TYPES.NONE
    });
  };

  handleClickChangePasswordButton = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPupopType: SETTINGS_POPUP_TYPES.CHANGE_PASSWORD
    });
  };

  handleClickEditName = () => {
    this.setState({ mode: EDITING_MODES.EDITING_NAME });
  };

  handleClickChangeRecoveryEmail = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPupopType: SETTINGS_POPUP_TYPES.CHANGE_RECOVERY_EMAIL
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

  handleChangeInputName = ev => {
    this.setState({
      nameParams: {
        name: ev.target.value.trim()
      }
    });
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
          twoFactorParams['twoFactorEnabled'] = nextValue;
          twoFactorParams['isLoading'] = false;
          this.setState({ twoFactorParams });
          setTwoFactorAuthStatus(nextValue);
        } else {
          twoFactorParams['isLoading'] = false;
          this.setState({ twoFactorParams });
        }
      }
    );
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

  handleAddNameInputKeyPressed = async e => {
    const inputValue = e.target.value.trim();
    const isValidName = validateFullname(inputValue);
    if (e.key === 'Enter' && inputValue !== '' && isValidName) {
      await this.props.onUpdateAccount({ name: inputValue });
      const nameParams = { name: inputValue };
      this.setState({
        nameParams,
        mode: EDITING_MODES.NONE
      });
    }
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
      return this.handleClickCancelChangePassword();
    }
    sendChangePasswordErrorMessage();
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
    const WRONG_PASSWORD_STATUS = 400;
    const INVALID_EMAIL_STATUS = 422;
    const SUCCESS_STATUS = 200;
    let errorMessage = '';
    let inputName = '';

    const { status } = await changeRecoveryEmail(params);
    if (status === SUCCESS_STATUS) {
      await this.props.onUpdateAccount({
        recoveryEmail: email,
        recoveryEmailConfirmed: false
      });
      return this.setState(
        {
          recoveryEmailParams: {
            recoveryEmail: email,
            recoveryEmailConfirmed: false
          }
        },
        () => {
          this.handleClickCancelChangeRecoveryEmail();
          sendRecoveryEmailChangedSuccessMessage();
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

  handleConfirmLogout = async () => {
    const isSuccess = await this.props.onLogout();
    if (isSuccess) {
      this.setState({
        isHiddenSettingsPopup: true,
        settingsPupopType: SETTINGS_POPUP_TYPES.NONE
      });
      await this.props.onDeleteDeviceData();
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };

  handleChangeTextareaSignature = signatureContent => {
    const signatureParams = {
      ...this.state.signatureParams,
      signature: signatureContent
    };
    this.setState({ signatureParams }, async () => {
      const htmlSignature = parseSignatureContentToHtml(signatureContent);
      await this.props.onUpdateAccount({ signature: htmlSignature });
    });
  };

  handleChangeRadioButtonSignature = async ev => {
    const value = ev.target.checked;
    await this.props.onUpdateAccount({ signatureEnabled: value });
    const signatureParams = {
      ...this.state.signatureParams,
      signatureEnabled: value
    };
    this.setState({ signatureParams });
  };

  handleClickLogout = () => {
    this.setState({
      isHiddenSettingsPopup: false,
      settingsPupopType: SETTINGS_POPUP_TYPES.LOGOUT
    });
  };

  initEventHandlers = () => {
    addEvent(Event.RECOVERY_EMAIL_CHANGED, recoveryEmail => {
      this.setState({
        recoveryEmailParams: {
          recoveryEmail: recoveryEmail,
          recoveryEmailConfirmed: false
        }
      });
    });

    addEvent(Event.RECOVERY_EMAIL_CONFIRMED, () => {
      this.setState({
        recoveryEmailParams: {
          ...this.state.recoveryEmailParams,
          recoveryEmailConfirmed: true
        }
      });
    });
  };
}

SettingGeneralWrapper.propTypes = {
  onDeleteDeviceData: PropTypes.func,
  onLogout: PropTypes.func,
  onResendConfirmationEmail: PropTypes.func,
  onUpdateAccount: PropTypes.func,
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  twoFactorAuth: PropTypes.bool
};

export {
  SettingGeneralWrapper as default,
  EDITING_MODES,
  SETTINGS_POPUP_TYPES
};
