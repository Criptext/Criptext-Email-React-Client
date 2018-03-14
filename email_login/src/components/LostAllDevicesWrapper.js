import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import {
  closeDialog,
  closeLogin,
  confirmForgotPasswordSentLink,
  confirmForgotPasswordEmptyEmail,
  openMailbox
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
      hasRecoveryEmail: true
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
        validator={this.validator}
        values={this.state.values}
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
    const newState = this.state;
    newState.values[event.target.name] = event.target.value;
    this.setState(newState);
    this.checkDisable();
  };

  handleSubmit = async event => {
    event.preventDefault();
    event.stopPropagation();
<<<<<<< 1eebb463e96e811fbe2565e6c4af88d28773171a
    openMailbox();
=======
    const submittedData = {
      username: this.state.values.username,
      password: this.state.values.password,
      deviceId: 1
    };
    const loginResponse = await signal.login(submittedData);
    const loginStatus = loginResponse.status;
    if (loginStatus === 200) {
      openMailbox();
      closeLogin();
    } else {
      alert(loginResponse.text);
    }
>>>>>>> Signal libs for login on Lost all devices
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

  validator = (formItemName, formItemValue) => {
    if (formItemName !== '') {
      return validatePassword(formItemValue);
    }
  };
}

LostDevicesWrapper.propTypes = {
  usernameValue: PropTypes.string
};

export default LostDevicesWrapper;
