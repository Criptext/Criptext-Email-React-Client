import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ExportBackupPopup, { PopUpModes } from './ExportBackupPopup';
import { requiredMinLength } from './../utils/electronInterface';
import { validatePassword } from './../validators/validators';

const inputTypes = {
  PASSWORD: 'password',
  TEXT: 'text'
};

class ExportBackupPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: PopUpModes.ENCRYPT,
      formItems: {
        password: {
          value: '',
          error: null,
          type: inputTypes.TEXT
        }
      },
      disabled: true
    };
  }

  render() {
    return (
      <ExportBackupPopup
        {...this.props}
        disabled={this.state.disabled}
        formItems={this.state.formItems}
        mode={this.state.mode}
        minLength={requiredMinLength.password}
        onClickChangeInputType={this.handleClickChangeInputType}
        onChangeInputValue={this.handleChangeInputValue}
        onSubmitForm={this.handleSubmitExportBackupForm}
        onChangeSwitch={this.handleChangeSwitch}
      />
    );
  }

  handleChangeInputValue = ev => {
    const value = ev.target.value.trim();
    this.setState(
      state => ({
        ...state,
        formItems: {
          ...state.formItems,
          password: {
            ...state.formItems.password,
            value
          }
        }
      }),
      this.checkDisableSubmit
    );
  };

  checkDisableSubmit = () => {
    const { password } = this.state.formItems;
    const passwordHasError = !validatePassword(password.value);
    this.setState(state => ({
      ...state,
      formItems: {
        password: {
          ...state.formItems.password,
          error: passwordHasError
        }
      },
      disabled: passwordHasError
    }));
  };

  handleChangeSwitch = () => {
    this.setState(prevState => {
      if (prevState.mode === PopUpModes.UNENCRYPT) {
        return {
          disabled: true,
          mode: PopUpModes.ENCRYPT
        };
      }
      return {
        mode: PopUpModes.UNENCRYPT,
        formItems: {
          password: {
            value: '',
            error: null,
            type: inputTypes.PASSWORD
          }
        },
        disabled: false
      };
    });
  };

  handleClickChangeInputType = () => {
    const prevInputType = this.state.formItems.password.type;
    const nextInputType =
      prevInputType === inputTypes.PASSWORD
        ? inputTypes.TEXT
        : inputTypes.PASSWORD;
    this.setState(state => ({
      ...state,
      formItems: {
        ...state.formItems,
        password: {
          ...state.formItems.password,
          type: nextInputType
        }
      }
    }));
  };

  handleSubmitExportBackupForm = () => {
    this.props.onSetExportBackupPassword({
      password: this.state.formItems.password.value
    });
  };
}

ExportBackupPopupWrapper.propTypes = {
  onSetExportBackupPassword: PropTypes.func
};

export { ExportBackupPopupWrapper as default, inputTypes };
