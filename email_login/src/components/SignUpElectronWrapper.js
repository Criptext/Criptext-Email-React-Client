import React, { Component } from 'react';
import SignUpWrapper from './SignUpWrapper';
import {
  checkAvailableUsername,
  confirmEmptyEmail,
  openCreateKeys
} from './../utils/electronInterface';
import { closeDialogWindow, closeLoginWindow } from './../utils/ipc';

const commitNewUser = validInputData => {
  openCreateKeys({
    loadingType: 'signup',
    remoteData: validInputData
  });
  closeLoginWindow();
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
      closeDialogWindow();
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
