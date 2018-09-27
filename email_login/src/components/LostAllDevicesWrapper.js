import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import {
  closeDialog,
  closeLogin,
  confirmForgotPasswordSentLink,
  confirmForgotPasswordEmptyEmail,
  errors,
  login,
  openCreateKeys,
  resetPassword,
  throwError
} from './../utils/electronInterface';
import { hashPassword } from '../utils/HashUtils';
import { censureEmailAddress } from '../utils/StringUtils';

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
    const values = { ...this.state.values };
    values[event.target.name] = event.target.value;
    this.setState({ values }, () => {
      this.checkDisable();
    });
  };

  handleClickSignInWithPassword = async event => {
    event.preventDefault();
    event.stopPropagation();
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
    const loginResponse = await login(submittedData);
    const loginStatus = loginResponse.status;
    if (loginStatus === 400) {
      this.throwLoginError(errors.login.WRONG_CREDENTIALS);
    } else if (loginStatus !== 200) {
      this.throwLoginError(errors.login.FAILED);
    } else {
      const recipientId = username;
      const { deviceId, name } = loginResponse.body;
      const remoteData = {
        recipientId,
        deviceId,
        name
      };
      openCreateKeys({ loadingType: 'login', remoteData });
      closeLogin();
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
          closeDialog();
        }
      });
    } else {
      confirmForgotPasswordEmptyEmail(customText, response => {
        if (response) {
          closeDialog();
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
    throwError({
      name: error.name,
      description: error.description
    });
  };
}

LostDevicesWrapper.propTypes = {
  usernameValue: PropTypes.string
};

export default LostDevicesWrapper;
