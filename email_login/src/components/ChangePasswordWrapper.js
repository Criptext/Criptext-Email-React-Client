import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChangePassword from './ChangePassword';
import {
  closeLoginWindow,
  loginFirst,
  openCreateKeysLoadingWindow,
  sendPin,
  throwError
} from '../utils/ipc';
import { hashPassword } from '../utils/HashUtils';
import {
  validateConfirmPassword,
  validateEnterprisePassword
} from '../validators/validators';
import { hasPin, DEFAULT_PIN } from '../utils/electronInterface';
import string from '../lang';
import * as ErrorMsgs from './SignUpErrorMsgs';

const LOGIN_FIRST_STATUS = {
  SUCCESS: 200,
  WRONG_CREDENTIALS: 400,
  VALIDATION_ERROR: 422,
  DEVICE_LIMIT: 439
};

const { changePassword } = string;
const items = [
  {
    name: 'newPassword',
    placeholder: changePassword.inputs.newPassword.placeholder,
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    value: '',
    optional: false,
    autoFocus: true
  },
  {
    name: 'repeatNewPassword',
    placeholder: changePassword.inputs.repeatNewPassword.placeholder,
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    value: '',
    optional: false
  }
];

class ChangePasswordWrapper extends Component {
  constructor() {
    super();
    this.state = {
      disabled: true,
      isLoading: false,
      isShowingPassword: false,
      values: {
        newPassword: '',
        repeatNewPassword: ''
      },
      errors: {
        newPassword: '',
        repeatNewPassword: ''
      }
    };
  }

  render() {
    return (
      <ChangePassword
        disabled={this.state.disabled || this.state.isLoading}
        errors={this.state.errors}
        isShowingPassword={this.state.isShowingPassword}
        items={items}
        values={this.state.values.newPassword}
        onChangeInput={this.handleChangeInput}
        onClickChangePassword={this.handleClickChangePassword}
        onToggleShowPassword={this.handleToggleShowPassword}
        {...this.props}
      />
    );
  }

  handleChangeInput = e => {
    const target = e.currentTarget.name;
    const value = e.target.value;
    this.setState(
      state => ({
        values: { ...state.values, [target]: value }
      }),
      () => {
        this.checkForm();
      }
    );
  };

  handleClickChangePassword = async () => {
    const [username, domain] = this.props.emailAddress.split('@');
    const hashedOldPassword = hashPassword(this.props.oldPassword);
    const hashedNewPassword = hashPassword(this.state.values.newPassword);
    const data = {
      username,
      domain,
      oldPassword: hashedOldPassword,
      newPassword: hashedNewPassword
    };
    this.setState({ isLoading: true });
    const res = await loginFirst(data);
    const { status, body, text } = res;
    switch (status) {
      case LOGIN_FIRST_STATUS.SUCCESS: {
        const { token, deviceId, name, addresses } = body;
        const recipientId = this.props.emailAddress;
        const hasPIN = hasPin();
        if (!hasPIN)
          await sendPin({
            pin: DEFAULT_PIN,
            shouldSave: false,
            shouldExport: false,
            shouldOnlySetPIN: true
          });
        openCreateKeysLoadingWindow({
          loadingType: 'signin-new-password',
          shouldResetPIN: !hasPIN,
          remoteData: {
            recipientId,
            deviceId,
            name,
            token,
            addresses
          }
        });
        closeLoginWindow({ forceClose: true });
        return;
      }
      case LOGIN_FIRST_STATUS.WRONG_CREDENTIALS: {
        this.throwLoginError(string.errors.wrongCredentials);
        break;
      }
      case LOGIN_FIRST_STATUS.VALIDATION_ERROR: {
        this.throwLoginError(text);
        break;
      }
      case LOGIN_FIRST_STATUS.DEVICE_LIMIT: {
        this.props.goBack();
        break;
      }
      default:
        break;
    }
    this.setState({ isLoading: false });
  };

  handleToggleShowPassword = () =>
    this.setState(state => ({
      isShowingPassword: !state.isShowingPassword
    }));

  checkForm = () => {
    const newPassword = this.state.values.newPassword;
    const repeatNewPassword = this.state.values.repeatNewPassword;
    const isValidPassword = validateEnterprisePassword(newPassword);
    const isValidConfirmPassword = validateConfirmPassword(
      newPassword,
      repeatNewPassword
    );
    if (
      (isValidPassword || !newPassword.length) &&
      !!this.state.errors.newPassword
    ) {
      this.setState(state => ({
        errors: { ...state.errors, newPassword: '' }
      }));
    } else if (!isValidPassword) {
      this.setState(state => ({
        errors: { ...state.errors, newPassword: ErrorMsgs.PASSWORD_INVALID },
        disabled: true
      }));
      return;
    }

    if (
      (isValidConfirmPassword || !repeatNewPassword.length) &&
      !!this.state.errors.repeatNewPassword
    ) {
      this.setState(state => ({
        errors: { ...state.errors, repeatNewPassword: '' }
      }));
    } else if (!isValidConfirmPassword && repeatNewPassword.length) {
      this.setState(state => ({
        errors: {
          ...state.errors,
          repeatNewPassword: ErrorMsgs.PASSWORD_NOMATCH
        },
        disabled: true
      }));
      return;
    }

    if (isValidPassword && isValidConfirmPassword) {
      this.setState({ disabled: false });
    }
  };

  throwLoginError = error => {
    throwError(error);
  };
}

ChangePasswordWrapper.propTypes = {
  goBack: PropTypes.func,
  emailAddress: PropTypes.string,
  oldPassword: PropTypes.string
};

export default ChangePasswordWrapper;
