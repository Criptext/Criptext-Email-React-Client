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
        isUsernameAvailable={this.isUsernameAvailable}
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

  isUsernameAvailable = async username => {
    const res = await checkAvailableUsername(username);
    return res.status === 200;
  };
}

export default SignUpElectronWrapper;
