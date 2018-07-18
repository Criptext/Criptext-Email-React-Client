import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NonCriptext, { PopUpModes } from './NonCriptext';
import {
  requiredMinLength,
  validatePassword,
  validateConfirmPassword
} from './../validators/validators';

const inputTypes = {
  PASSWORD: 'password',
  TEXT: 'text'
};

class NonCriptextWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: PopUpModes.SET_PASSWORD,
      formItems: {
        password: {
          value: '',
          error: null,
          type: inputTypes.PASSWORD
        },
        confirmPassword: {
          value: '',
          error: null,
          type: inputTypes.PASSWORD
        }
      },
      disabled: true
    };
  }

  render() {
    return (
      <NonCriptext
        {...this.props}
        disabled={this.state.disabled}
        formItems={this.state.formItems}
        mode={this.state.mode}
        minLength={requiredMinLength.password}
        onClickChangeInputType={this.handleClickChangeInputType}
        onChangeInputValue={this.handleChangeInputValue}
        onSubmitForm={this.handleSubmitNonCriptextRecipientsForm}
        onChangeSwitch={this.handleChangeSwitch}
      />
    );
  }

  handleChangeInputValue = (ev, field) => {
    const newFieldInfo = {
      ...this.state.formItems[field],
      value: ev.target.value
    };
    const newState = {
      ...this.state,
      formItems: {
        ...this.state.formItems,
        [field]: newFieldInfo
      }
    };
    this.setState(newState, () => {
      this.checkDisableSubmit();
    });
  };

  checkDisableSubmit = () => {
    const { password, confirmPassword } = this.state.formItems;
    const passwordHasError = !validatePassword(password.value);
    const confirmPasswordHasError = !validateConfirmPassword(
      password.value,
      confirmPassword.value
    );
    const newFormItemsState = {
      password: {
        ...this.state.formItems.password,
        error: passwordHasError
      },
      confirmPassword: {
        ...this.state.formItems.confirmPassword,
        error: confirmPasswordHasError
      }
    };
    const disabled = passwordHasError || confirmPasswordHasError;
    this.setState({
      formItems: newFormItemsState,
      disabled
    });
  };

  handleChangeSwitch = () => {
    this.setState(prevState => {
      if (prevState.mode === PopUpModes.NO_PASSWORD) {
        return {
          disabled: true,
          mode: PopUpModes.SET_PASSWORD
        };
      }
      return {
        mode: PopUpModes.NO_PASSWORD,
        formItems: {
          password: {
            value: '',
            error: null,
            type: inputTypes.PASSWORD
          },
          confirmPassword: {
            value: '',
            error: null,
            type: inputTypes.PASSWORD
          }
        },
        disabled: false
      };
    });
  };

  handleClickChangeInputType = field => {
    const prevInputType = this.state.formItems[field].type;
    const newType =
      prevInputType === inputTypes.PASSWORD
        ? inputTypes.TEXT
        : inputTypes.PASSWORD;
    const newFieldInfo = {
      ...this.state.formItems[field],
      type: newType
    };
    const newState = {
      ...this.state,
      formItems: {
        ...this.state.formItems,
        [field]: newFieldInfo
      }
    };
    this.setState(newState);
  };

  handleSubmitNonCriptextRecipientsForm = async () => {
    await this.props.onSetNonCriptextRecipientsPassword({
      password: this.state.formItems.password.value,
      displayPopup: false
    });
    this.props.onClickSendMessage();
  };
}

NonCriptextWrapper.propTypes = {
  onClickSendMessage: PropTypes.func,
  onSetNonCriptextRecipientsPassword: PropTypes.func
};

export { NonCriptextWrapper as default, inputTypes };
