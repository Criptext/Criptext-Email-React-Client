import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hashPassword } from '../utils/hashUtils';
import { validatePassword } from '../validators/validators';
import { requiredMinLength } from './../utils/electronInterface';
import RemoveDevicePopup from './RemoveDevicePopup';
import string from './../lang';

const passwordErrors = string.popups.remove_device.input.password.errors;

class RemoveDevicePopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledConfirmButton: true,
      isDisabledInput: false,
      type: 'password',
      icon: 'icon-not-show',
      value: '',
      errorMessage: '',
      hasError: false,
      isLoading: false
    };
  }

  render() {
    return (
      <RemoveDevicePopup
        isDisabledConfirmButton={this.state.isDisabledConfirmButton}
        isDisabledInput={this.state.isDisabledInput}
        type={this.state.type}
        icon={this.state.icon}
        value={this.state.value}
        errorMessage={this.state.errorMessage}
        hasError={this.state.hasError}
        isLoading={this.state.isLoading}
        onChangeInputValue={this.handleChangeInputValue}
        onClickCancelPasswordChanged={this.handleClickCancelPasswordChanged}
        onClickChangeInputType={this.handleClickChangeInputType}
        onClickConfirmRemoveDevice={this.handleClickConfirmRemoveDevice}
        {...this.props}
      />
    );
  }

  handleChangeInputValue = ev => {
    const value = ev.target.value.trim();
    const { hasError, errorMessage } = this.checkInputError(value);
    this.setState({ value, hasError, errorMessage }, () => {
      this.checkDisabledConfirmButton();
    });
  };

  checkInputError = value => {
    const isValid = validatePassword(value);
    const errorMessage = `${string.errors.password.length.a} ${
      requiredMinLength.password
    } ${string.errors.password.length.b}`;
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

  handleClickConfirmRemoveDevice = async () => {
    const params = {
      deviceId: this.props.deviceId,
      password: hashPassword(this.state.value)
    };
    this.setState({
      isLoading: true,
      hasError: false
    });
    const status = await this.props.onDeviceToRemove(params);
    switch (status) {
      case 200:
        break;
      case 400:
        this.setState({
          isLoading: false,
          errorMessage: passwordErrors.wrong,
          hasError: true
        });
        break;
      default:
        this.setState({
          isLoading: false,
          errorMessage: string.formatString(passwordErrors.unknown, status),
          hasError: true
        });
        break;
    }
  };
}

RemoveDevicePopupWrapper.propTypes = {
  deviceId: PropTypes.number,
  onDeviceToRemove: PropTypes.func
};

export default RemoveDevicePopupWrapper;
