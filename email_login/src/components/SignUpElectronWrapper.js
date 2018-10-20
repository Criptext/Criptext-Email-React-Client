import React, { Component } from 'react';
import SignUpWrapper from './SignUpWrapper';
import {
  checkAvailableUsername,
  closeDialog,
  confirmEmptyEmail,
  openCreateKeys,
  closeLogin
} from './../utils/electronInterface';

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
