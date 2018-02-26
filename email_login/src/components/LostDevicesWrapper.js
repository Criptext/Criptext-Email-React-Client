import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validateUsername, validatePassword } from './../validators/validators';
import LostAllDevices from './LostAllDevices';

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

  handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const submittedData = {
      username: this.state.values.username,
      password: this.state.values.password
    };
    this.props.onLoginUser(submittedData);
  };

  validator = (formItemName, formItemValue) => {
    let result;
    switch (formItemName) {
      case 'username': {
        result = validateUsername(formItemValue);
        break;
      }
      default:
        result = validatePassword(formItemValue);
    }
    return result;
  };
}

LostDevicesWrapper.propTypes = {
  onLoginUser: PropTypes.func
};

export default LostDevicesWrapper;
