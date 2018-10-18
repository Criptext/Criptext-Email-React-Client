import React, { Component } from 'react';
import SignUpWrapper from './components/SignUpWrapper';
import { runReCaptcha } from './validators/grecaptcha';
import './webapp.scss';

const checkAvailableUsername = () => Promise.resolve({ status: 200 });

const onFormReady = data => {
  console.log('form is ready');
  runReCaptcha().then(recaptchaToken => {
    console.log('validated: ', { ...data, recaptchaToken });
  });
};

const onSubmitWithoutRecoveryEmail = () => {
  console.log('are you insane?');
};

class WebApp extends Component {
  render() {
    return (
      <div className="main-container">
        <SignUpWrapper
          web={true}
          checkAvailableUsername={checkAvailableUsername}
          onSubmitWithoutRecoveryEmail={onSubmitWithoutRecoveryEmail}
          onFormReady={onFormReady}
        />
      </div>
    );
  }
}

export default WebApp;
