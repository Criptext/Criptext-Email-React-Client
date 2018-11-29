import React, { Component } from 'react';
import SignUpWrapper from './SignUpWrapper';
import {
  checkAvailableUsername,
  confirmEmptyEmail,
  openCreateKeys,
  closeLogin
} from './../utils/electronInterface';
import { closeDialog } from './../utils/ipc';

const commitNewUser = validInputData => {
  openCreateKeys({
    loadingType: 'signup',
    remoteData: validInputData
  });
  closeLogin();
};

class SignUpElectronWrapper extends Component {
  render() {
    return (
      <SignUpWrapper
        {...this.props}
        checkAvailableUsername={checkAvailableUsername}
        onFormReady={this.onFormReady}
        onSubmitWithoutRecoveryEmail={this.onSubmitWithoutRecoveryEmail}
      />
    );
  }

  onSubmitWithoutRecoveryEmail = validInputData => {
    confirmEmptyEmail(response => {
      closeDialog();
      if (response === 'Confirm') commitNewUser(validInputData);
    });
  };

  onFormReady = validInputData => {
    if (validInputData.recoveryEmail === '')
      return this.onSubmitWithoutRecoveryEmail(validInputData);
    commitNewUser(validInputData);
  };
}

export default SignUpElectronWrapper;
