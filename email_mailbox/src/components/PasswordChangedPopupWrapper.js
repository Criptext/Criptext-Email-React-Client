import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hashPassword } from '../utils/hashUtils';
import { validatePassword } from '../validators/validators';
import { requiredMinLength, unlockDevice } from './../utils/electronInterface';
import PasswordChangedPopup from './PasswordChangedPopup';
import { handleDeleteDeviceData } from '../utils/electronEventInterface';

class PasswordChangedPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledConfirmButton: true,
      isDisabledInput: false,
      type: 'password',
      icon: 'icon-not-show',
      value: '',
      errorMessage: '',
      hasError: false
    };
  }

  render() {
    return (
      <PasswordChangedPopup
        isDisabledConfirmButton={this.state.isDisabledConfirmButton}
        isDisabledInput={this.state.isDisabledInput}
        type={this.state.type}
        icon={this.state.icon}
        value={this.state.value}
        errorMessage={this.state.errorMessage}
        hasError={this.state.hasError}
        onChangeInputValue={this.handleChangeInputValue}
        onClickChangeInputType={this.handleClickChangeInputType}
        onConfirmPasswordChanged={this.handleConfirmPasswordChanged}
        onClickCancelPasswordChanged={this.handleClickCancelPasswordChanged}
        {...this.props}
      />
    );
  }

  handleClickCancelPasswordChanged = () => {
    this.setState(
      {
        isDisabledInput: true,
        hasError: true,
        errorMessage: 'Canceled. Deleting data...'
      },
      () => {
        handleDeleteDeviceData();
      }
    );
  };

  handleChangeInputValue = ev => {
    const value = ev.target.value.trim();
    const { hasError, errorMessage } = this.checkInputError(value);
    this.setState({ value, hasError, errorMessage }, () => {
      this.checkDisabledConfirmButton();
    });
  };

  checkInputError = value => {
    const isValid = validatePassword(value);
    const errorMessage = `Must be at least ${
      requiredMinLength.password
    } characters`;
    return { hasError: !isValid, errorMessage };
  };

  checkDisabledConfirmButton = () => {
    const isDisabledConfirmButton = this.state.hasError;
    this.setState({ isDisabledConfirmButton });
  };

  handleClickChangeInputType = () => {
    const [type, icon] =
      this.state.type === 'password'
        ? ['text', 'icon-show']
        : ['password', 'icon-not-show'];
    this.setState({ type, icon });
  };

  handleConfirmPasswordChanged = async () => {
    const params = {
      password: hashPassword(this.state.value)
    };
    const { status } = await unlockDevice(params);
    if (status === 400) {
      return this.setState({
        hasError: true,
        errorMessage: 'Wrong password'
      });
    }
    if (status === 200) {
      return this.props.onCloseMailboxPopup();
    }
  };
}

PasswordChangedPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default PasswordChangedPopupWrapper;
