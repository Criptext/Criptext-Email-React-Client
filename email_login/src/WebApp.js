import React, { Component } from 'react';
import SignUpWrapper from './components/SignUpWrapper';
import './app.scss';

const checkAvailableUsername = () => Promise.resolve({ status: 200 });
const onFormReady = () => {
  console.log('ready!');
};
const onSubmitWithoutRecoveryEmail = () => {
  console.log('are you insane?');
};

class WebApp extends Component {
  render() {
    return (
      <div className="main-container">
        <SignUpWrapper
          checkAvailableUsername={checkAvailableUsername}
          onSubmitWithoutRecoveryEmail={onSubmitWithoutRecoveryEmail}
          onFormReady={onFormReady}
        />
      </div>
    );
  }
}

export default WebApp;
