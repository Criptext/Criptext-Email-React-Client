import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PasswordChangedPopup from './PasswordChangedPopup';
import { hashPassword } from '../utils/hashUtils';
import { validatePassword } from '../validators/validators';
import { requiredMinLength } from './../utils/electronInterface';
import { throwError, unlockDevice } from './../utils/ipc';
import { handleDeleteDeviceData } from '../utils/electronEventInterface';
import { parseRateLimitBlockingTime } from './../utils/TimeUtils';
import string from './../lang';

const UNLOCK_DEVICE_STATUS = {
  SUCCESS: 200,
  WRONG_PASSWORD: 400,
  TOO_MANY_REQUESTS: 429
};

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
        handleDeleteDeviceData(true);
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

  handleConfirmPasswordChanged = async () => {
    const params = {
      password: hashPassword(this.state.value)
    };
    const { status, headers } = await unlockDevice(params);
    switch (status) {
      case UNLOCK_DEVICE_STATUS.SUCCESS: {
        this.props.onCloseMailboxPopup();
        return;
      }
      case UNLOCK_DEVICE_STATUS.TOO_MANY_REQUESTS: {
        const seconds = headers['retry-after'];
        const tooManyRequestErrorMessage = {
          ...string.errors.tooManyRequests
        };
        tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
          seconds
        );
        throwError(tooManyRequestErrorMessage);
        return;
      }
      case UNLOCK_DEVICE_STATUS.WRONG_PASSWORD: {
        this.setState({
          hasError: true,
          errorMessage: 'Wrong password'
        });
        return;
      }
      default: {
        throwError({
          name: 'Failed to confirm password',
          description: `Code: ${status || 'Unknown'}`
        });
        return;
      }
    }
  };
}

PasswordChangedPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default PasswordChangedPopupWrapper;
