import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  myAccount,
  requiredMinLength,
  changePassword
} from './../utils/electronInterface';
import SettingGeneral from './SettingGeneral';
import { EditorState } from 'draft-js';
import {
  parseSignatureHtmlToEdit,
  parseSignatureContentToHtml
} from '../utils/EmailUtils';
import {
  sendRemoveDeviceErrorMessage,
  sendChangePasswordErrorMessage,
  sendChangePasswordSuccessMessage
} from '../utils/electronEventInterface';
import {
  validateFullname,
  validatePassword,
  validateConfirmPassword
} from '../validators/validators';
import { hashPassword } from '../utils/hashUtils';

const inputNameModes = {
  EDITING: 'editing',
  NONE: 'none'
};

const changePasswordErrors = {
  LENGTH: `Must be at least ${requiredMinLength.password} characters`,
  MATCH: 'Passwords do not match'
};

/* eslint-disable-next-line react/no-deprecated */
class SettingGeneralWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledChangePasswordButton: true,
      isHiddenChangePasswordPopup: true,
      mode: inputNameModes.NONE,
      name: '',
      confirmNewPasswordInput: {
        name: 'confirmNewPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      },
      newPasswordInput: {
        name: 'newPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      },
      oldPasswordInput: {
        name: 'oldPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      },
      signatureEnabled: undefined,
      signature: EditorState.createEmpty()
    };
  }

  render() {
    return (
      <SettingGeneral
        confirmNewPasswordInput={this.state.confirmNewPasswordInput}
        isDisabledChangePasswordButton={
          this.state.isDisabledChangePasswordButton
        }
        isHiddenChangePasswordPopup={this.state.isHiddenChangePasswordPopup}
        mode={this.state.mode}
        name={this.state.name}
        newPasswordInput={this.state.newPasswordInput}
        oldPasswordInput={this.state.oldPasswordInput}
        onAddNameInputKeyPressed={this.handleAddNameInputKeyPressed}
        onBlurInputName={this.handleBlurInputName}
        onChangeInputName={this.handleChangeInputName}
        onChangeInputValueChangePassword={
          this.handleChangeInputValueChangePassword
        }
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
        onClickCancelChangePassword={this.handleClickCancelChangePassword}
        onClickChangePasswordButton={this.handleClickChangePasswordButton}
        onClickChangePasswordInputType={this.handleClickChangePasswordInputType}
        onClickEditName={this.handleClickEditName}
        onClickLogout={this.handleClickLogout}
        onConfirmChangePassword={this.handleConfirmChangePassword}
        signatureEnabled={this.state.signatureEnabled}
        signature={this.state.signature}
      />
    );
  }

  componentDidMount() {
    const signature = parseSignatureHtmlToEdit(myAccount.signature);
    this.setState({
      name: myAccount.name,
      signature,
      signatureEnabled: !!myAccount.signatureEnabled
    });
  }

  handleBlurInputName = e => {
    const currentTarget = e.currentTarget;
    if (!currentTarget.contains(document.activeElement)) {
      this.setState({
        mode: inputNameModes.NONE
      });
    }
  };

  handleClickCancelChangePassword = () => {
    this.setState({
      isHiddenChangePasswordPopup: true,
      confirmNewPasswordInput: {
        name: 'confirmNewPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      },
      newPasswordInput: {
        name: 'newPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      },
      oldPasswordInput: {
        name: 'oldPasswordInput',
        type: 'password',
        icon: 'icon-not-show',
        value: '',
        errorMessage: '',
        hasError: false
      }
    });
  };

  handleClickChangePasswordButton = () => {
    this.setState({ isHiddenChangePasswordPopup: false });
  };

  handleClickEditName = () => {
    this.setState({ mode: inputNameModes.EDITING });
  };

  handleChangeInputName = ev => {
    this.setState({ name: ev.target.value });
  };

  handleChangeInputValueChangePassword = ev => {
    const value = ev.target.value.trim();
    const name = ev.target.getAttribute('name');
    const { hasError, errorMessage } = this.checkInputError(name, value);
    const newState = {
      ...this.state,
      [name]: { ...this.state[name], value, hasError, errorMessage }
    };
    this.setState(newState, () => {
      this.checkDisabledChangePasswordButton();
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
          this.state.newPasswordInput.value,
          value
        );
        const errorMessage = changePasswordErrors.MATCH;
        return { hasError: !isMatched, errorMessage };
      }
      default:
        break;
    }
  };

  checkDisabledChangePasswordButton = () => {
    const isDisabled =
      this.state.oldPasswordInput.hasError ||
      this.state.newPasswordInput.hasError ||
      this.state.confirmNewPasswordInput.hasError;
    this.setState({ isDisabledChangePasswordButton: isDisabled });
  };

  handleClickChangePasswordInputType = name => {
    const [type, icon] =
      this.state[name].type === 'password'
        ? ['text', 'icon-show']
        : ['password', 'icon-not-show'];
    const newState = {
      ...this.state,
      [name]: { ...this.state[name], type, icon }
    };
    this.setState(newState);
  };

  handleAddNameInputKeyPressed = async e => {
    const inputValue = e.target.value.trim();
    const isValidName = validateFullname(inputValue);
    if (e.key === 'Enter' && inputValue !== '' && isValidName) {
      await this.props.onUpdateAccount({ name: inputValue });
      this.setState({
        name: myAccount.name,
        mode: inputNameModes.NONE
      });
    }
  };

  handleConfirmChangePassword = async () => {
    const params = {
      oldPassword: hashPassword(this.state.oldPasswordInput.value),
      newPassword: hashPassword(this.state.newPasswordInput.value)
    };
    const { status } = await changePassword(params);
    if (status === 400) {
      const oldPasswordInput = {
        ...this.state.oldPasswordInput,
        hasError: true,
        errorMessage: 'Wrong password'
      };
      const newState = {
        ...this.state,
        oldPasswordInput
      };
      return this.setState(newState);
    }
    if (status === 200) {
      sendChangePasswordSuccessMessage();
      return this.handleClickCancelChangePassword();
    }
    sendChangePasswordErrorMessage();
  };

  handleChangeTextareaSignature = signatureContent => {
    this.setState({ signature: signatureContent }, async () => {
      const htmlSignature = parseSignatureContentToHtml(signatureContent);
      await this.props.onUpdateAccount({ signature: htmlSignature });
    });
  };

  handleChangeRadioButtonSignature = async value => {
    await this.props.onUpdateAccount({ signatureEnabled: value });
    this.setState({ signatureEnabled: value });
  };

  handleClickLogout = async () => {
    const isSuccess = await this.props.onLogout();
    if (isSuccess) {
      await this.props.onDeleteDeviceData();
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };
}

SettingGeneralWrapper.propTypes = {
  onDeleteDeviceData: PropTypes.func,
  onLogout: PropTypes.func,
  onUpdateAccount: PropTypes.func
};

export { SettingGeneralWrapper as default, inputNameModes };
