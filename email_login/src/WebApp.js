import React, { Component } from 'react';
import SignUpWrapper from './components/SignUpWrapper';
import { runReCaptcha } from './validators/grecaptcha';
import './webapp.scss';

const checkAvailableUsername = () => Promise.resolve({ status: 200 });

const submitWithoutRecoveryEmailQ =
  'Are you sure you want to create an account without a recovery email address? If you lose your password you will never get back your account.';

const onFormReady = data => {
  if (data.recoveryEmail === '' && !window.confirm(submitWithoutRecoveryEmailQ))
    return;

  runReCaptcha().then(recaptchaToken => {
    console.log('validated: ', { ...data, recaptchaToken });
  });
};

class WebApp extends Component {
  render() {
    return (
      <div className="main-container">
        <SignUpWrapper
          web={true}
          checkAvailableUsername={checkAvailableUsername}
          onFormReady={onFormReady}
        />
      </div>
    );
  }
}

export default WebApp;
