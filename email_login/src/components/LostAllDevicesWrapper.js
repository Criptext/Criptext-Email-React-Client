import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import {
  confirmForgotPasswordSentLink,
  confirmForgotPasswordEmptyEmail,
  errors,
  login,
  openCreateKeys,
  resetPassword
} from './../utils/electronInterface';
import {
  closeDialogWindow,
  closeLoginWindow,
  throwError
} from './../utils/ipc';
import { hashPassword } from '../utils/HashUtils';
import { censureEmailAddress } from '../utils/StringUtils';
import { parseRateLimitBlockingTime } from './../utils/TimeUtils';

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
        openCreateKeys({
          loadingType: 'login',
          remoteData: {
            recipientId,
            deviceId,
            name
          }
        });
        closeLoginWindow();
        break;
      }
      case LOGIN_STATUS.WRONG_CREDENTIALS: {
        this.throwLoginError(errors.login.WRONG_CREDENTIALS);
        break;
      }
      case LOGIN_STATUS.TOO_MANY_REQUESTS: {
        const seconds = headers['retry-after'];
        const tooManyRequestErrorMessage = {
          ...errors.login.TOO_MANY_REQUESTS
        };
        // eslint-disable-next-line fp/no-mutation
        tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
          seconds
        );
        this.throwLoginError(tooManyRequestErrorMessage);
        break;
      }
      case LOGIN_STATUS.TOO_MANY_DEVICES: {
        this.throwLoginError(errors.login.TOO_MANY_DEVICES);
        break;
      }
      default: {
        this.throwLoginError({
          name: errors.login.FAILED.name,
          description:
            errors.login.FAILED.description + `${status || 'Unknown'}`
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
    if (status === 200) {
      confirmForgotPasswordSentLink(customText, response => {
        if (response) {
          closeDialogWindow();
        }
      });
    } else {
      confirmForgotPasswordEmptyEmail(customText, response => {
        if (response) {
          closeDialogWindow();
        }
      });
    }
  };

  getForgotPasswordMessage = (status, text) => {
    if (status === 200) {
      const { address } = JSON.parse(text);
      return `A reset link was sent to ${censureEmailAddress(
        address
      )}\nThe link will be valid for 30 minutes`;
    }
    return text;
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
