import React, { Component } from 'react';
import SignUpWrapper from './SignUpWrapper';
import {
  checkAvailableUsername,
  closeDialog,
  confirmEmptyEmail,
  openCreateKeys,
  closeLogin
} from './../utils/electronInterface';

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

  onSubmitWithoutRecoveryEmail = responseCallback => {
    confirmEmptyEmail(response => {
      closeDialog();
      responseCallback(response);
    });
  };

  onFormReady = validInputData => {
    if (validInputData) {
      openCreateKeys({
        loadingType: 'signup',
        remoteData: validInputData
      });
      closeLogin();
    }
  };
}

export default SignUpElectronWrapper;
