import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import {
  closeDialog,
  closeLogin,
  confirmForgotPasswordSentLink,
  confirmForgotPasswordEmptyEmail,
  login,
  openMailbox,
  throwError,
  errors
} from './../utils/electronInterface';
import signal from './../libs/signal';

class LostDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        username: props.usernameValue,
        password: ''
      },
      disabled: true,
      hasRecoveryEmail: true,
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
        handleSubmit={this.handleSubmit}
        onChangeField={this.handleChange}
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

  handleChange = event => {
    const values = { ...this.state.values };
    values[event.target.name] = event.target.value;
    this.setState({ values }, () => {
      this.checkDisable();
    });
  };

  handleSubmit = async event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      isLoading: true,
      disabled: true
    });
    const submittedData = {
      username: this.state.values.username,
      password: this.state.values.password
    };
    const loginResponse = await login(submittedData);
    const loginStatus = loginResponse.status;
    if (loginStatus === 400) {
      this.throwLoginError(errors.login.WRONG_CREDENTIALS);
    } else if (loginStatus !== 200) {
      this.throwLoginError(errors.login.FAILED);
    } else {
      const recipientId = this.state.values.username;
      const { deviceId, name, token } = loginResponse.body;
      await this.loginAccount({ recipientId, deviceId, name, token });
    }
  };

  handleForgot = event => {
    event.preventDefault();
    event.stopPropagation();
    if (this.state.hasRecoveryEmail === true) {
      confirmForgotPasswordSentLink(response => {
        if (response) {
          closeDialog();
        }
      });
    } else {
      confirmForgotPasswordEmptyEmail(response => {
        if (response) {
          closeDialog();
        }
      });
    }
  };

  loginAccount = async ({ recipientId, deviceId, name, token }) => {
    try {
      const response = await signal.registerAccount({
        recipientId,
        deviceId,
        name,
        token
      });
      if (response) {
        openMailbox();
        closeLogin();
      } else {
        this.throwLoginError(errors.login.FAILED);
      }
    } catch (e) {
      this.throwLoginError(e);
    }
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
