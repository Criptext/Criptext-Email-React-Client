import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validateUsername, validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';
import { openMailbox, closeLogin } from './../utils/electronInterface';
import signal from './../libs/signal';

class LostDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        username: '',
        password: ''
      },
      disabled: true
    };
  }

  componentDidMount() {
    this.checkDisable();
  }

  render() {
    return (
      <LostAllDevices
        handleSubmit={this.handleSubmit}
        onChangeField={this.handleChange}
        disabled={this.state.disabled}
        validator={this.validator}
        values={this.state.values}
      />
    );
  }

  validateUsername = () => {
    const username = this.state.values['username'];
    return validateUsername(username);
  };

  validatePassword = () => {
    const password = this.state.values['password'];
    return validatePassword(password);
  };

  checkDisable = () => {
    const isValid = this.validateUsername() && this.validatePassword();
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

  handleSubmit = async (event) => {
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

  validator = (formItemName, formItemValue) => {
    if (formItemName === 'username') {
      return validateUsername(formItemValue);
    }
    return validatePassword(formItemValue);
  };
}

LostDevicesWrapper.propTypes = {
  onLoginUser: PropTypes.func
};

export default LostDevicesWrapper;
