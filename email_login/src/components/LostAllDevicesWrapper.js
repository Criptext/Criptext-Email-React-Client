import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import {
  closeLoginWindow,
  login,
  openCreateKeysLoadingWindow,
  resetPassword,
  throwError
} from './../utils/ipc';
import { hashPassword } from '../utils/HashUtils';
import { parseRateLimitBlockingTime } from './../utils/TimeUtils';
import { PopupTypes } from './LoginPopup';
import string from './../lang';

const { passwordLogin } = string;

const LOGIN_STATUS = {
  SUCCESS: 200,
  WRONG_CREDENTIALS: 400,
  TOO_MANY_REQUESTS: 429,
  TOO_MANY_DEVICES: 439
};

class LostDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        username: props.usernameValue,
        password: ''
      },
      disabled: true,
      isLoading: false
    };
  }

  componentDidMount() {
    this.checkDisable();
  }

  render() {
    return (
      <LostAllDevices
        {...this.props}
        handleForgot={this.handleForgot}
        onCLickSignInWithPassword={this.handleClickSignInWithPassword}
        onChangeField={this.handleChangeField}
        disabled={this.state.disabled}
        validator={this.validatePassword}
        values={this.state.values}
        isLoading={this.state.isLoading}
        popupContent={this.state.popupContent}
        onDismissPopup={this.onDismissPopup}
      />
    );
  }

  validatePassword = () => {
    const password = this.state.values['password'];
    return validatePassword(password);
  };

  checkDisable = () => {
    const isValid = this.validatePassword();
    this.setState({
      disabled: !isValid
    });
  };

  handleChangeField = event => {
    const values = {
      ...this.state.values,
      [event.target.name]: event.target.value
    };
    this.setState({ values }, () => {
      this.checkDisable();
    });
  };

  handleClickSignInWithPassword = async event => {
    event.preventDefault();
    event.stopPropagation();
    if (this.props.hasTwoFactorAuth) {
      this.props.goToWaitingApproval(this.state.values.password);
    } else {
      this.setState({
        isLoading: true,
        disabled: true
      });
      const username = this.state.values.username;
      const password = this.state.values.password;
      const hashedPassword = hashPassword(password);
      const submittedData = {
        username,
        password: hashedPassword
      };
      const res = await login(submittedData);
      const { status, body, headers } = res;
      this.handleLoginStatus(status, body, headers, username);
    }
  };

  handleLoginStatus = (status, body, headers, username) => {
    switch (status) {
      case LOGIN_STATUS.SUCCESS: {
        const recipientId = username;
        const { deviceId, name } = body;
        openCreateKeysLoadingWindow({
          loadingType: 'login',
          remoteData: {
            recipientId,
            deviceId,
            name
          }
        });
        closeLoginWindow(true);
        break;
      }
      case LOGIN_STATUS.WRONG_CREDENTIALS: {
        this.throwLoginError(string.errors.wrongCredentials);
        break;
      }
      case LOGIN_STATUS.TOO_MANY_REQUESTS: {
        const seconds = headers['retry-after'];
        const tooManyRequestErrorMessage = {
          ...string.errors.tooManyRequests
        };
        // eslint-disable-next-line fp/no-mutation
        tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
          seconds
        );
        this.throwLoginError(tooManyRequestErrorMessage);
        break;
      }
      case LOGIN_STATUS.TOO_MANY_DEVICES: {
        this.throwLoginError(string.errors.tooManyDevices);
        break;
      }
      default: {
        this.throwLoginError({
          name: string.errors.loginFailed.name,
          description: string.errors.loginFailed.description + status
        });
        break;
      }
    }
  };

  handleForgot = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const recipientId = this.state.values.username;
    const { status, text } = await resetPassword(recipientId);
    const customText = this.getForgotPasswordMessage(status, text);
    const messages = passwordLogin.forgotPasswordMessage;
    switch (status) {
      case 200:
        return this.props.setPopupContent({
          title: messages.title,
          prefix: messages.prefix,
          suffix: messages.suffix,
          dismissButtonLabel: messages.dismissButtonLabel,
          email: customText,
          type: PopupTypes.FORGOT_LINK
        });
      case 400:
        return this.props.setPopupContent({
          title: messages.notSetError.title,
          dismissButtonLabel: messages.notSetError.dismissButtonLabel,
          message: messages.notSetError.message,
          email: 'support@criptext.com',
          type: PopupTypes.EMAIL_NOT_SET
        });
      default:
        return this.props.setPopupContent({
          title: messages.fallbackError.title,
          dismissButtonLabel: messages.fallbackError.dismissButtonLabel,
          message: messages.fallbackError.message
        });
    }
  };

  onDismissPopup = () => {
    this.setState({
      popupContent: null
    });
  };

  getForgotPasswordMessage = (status, text) => {
    if (status === 200) {
      const { address } = JSON.parse(text);
      return address;
    }
    return passwordLogin.forgotPasswordMessage.error;
  };

  throwLoginError = error => {
    this.setState({
      isLoading: false,
      disabled: false
    });
    throwError(error);
  };
}

// eslint-disable-next-line fp/no-mutation
LostDevicesWrapper.propTypes = {
  usernameValue: PropTypes.string
};

export default LostDevicesWrapper;
