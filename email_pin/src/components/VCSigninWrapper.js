import React, { Component } from 'react';
import ScreenSignin, { step } from './ScreenSignin';
import { closePinWindow, sendPin } from './../utils/ipc';
import { getPin } from './../utils/electronInterface';

import VCHOC from './VCHOC';

const VCSignin = VCHOC(ScreenSignin);

class VCSigninWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: step.START,
      steps: [step.START]
    };
    this.pin = getPin();
    this.askKeyChain = false;
  }

  render() {
    return (
      <VCSignin
        askKeyChain={this.askKeyChain}
        currentStep={this.state.currentStep}
        onClickBackView={this.handleClickBackView}
        onClickChangeIt={this.handleClickChangeIt}
        onClickCompleteIt={this.handleClickCompleteIt}
        onClickKeepIt={this.handleClickKeepIt}
        onClickSavedIt={this.handleClickSavedIt}
        onClickSetPin={this.handleClickSetPin}
        onClickStart={this.handleClickStart}
        onClickForgot={this.handleClickForgotPin}
        pin={this.pin}
        steps={this.state.steps}
      />
    );
  }

  handleClickBackView = ({ steps, currentStep }) => {
    this.setState({
      steps,
      currentStep
    });
  };

  handleClickStart = () => {
    if (!this.pin) this.pin = `${Math.round(Math.random() * 9000) + 1000}`;
    this.setState(state => ({
      steps: this.concat(state.steps, step.PIN_GENERATED),
      currentStep: step.PIN_GENERATED
    }));
  };

  handleClickKeepIt = () => {
    this.setState(state => ({
      steps: this.concat(state.steps, step.PIN_SAVED),
      currentStep: step.PIN_SAVED
    }));
  };

  handleClickChangeIt = () => {
    this.askKeyChain = true;
    this.setState(state => ({
      steps: this.concat(state.steps, step.PIN_NEW),
      currentStep: step.PIN_NEW
    }));
  };

  handleClickSetPin = pin => {
    this.pin = pin;
    this.setState(state => ({
      steps: this.concat(state.steps, step.PIN_SAVED),
      currentStep: step.PIN_SAVED
    }));
  };

  handleClickSavedIt = () => {
    this.setState(state => ({
      steps: this.concat(state.steps, step.COMPLETE),
      currentStep: step.COMPLETE
    }));
  };

  handleClickCompleteIt = async value => {
    this.setState(state => ({
      steps: this.concat(state.steps, step.ENCRYPTION),
      currentStep: step.ENCRYPTION
    }));
    await sendPin({
      pin: this.pin,
      shouldSave: value,
      shouldExport: false,
      shouldResetPin: true
    });
    closePinWindow({ forceClose: true });
  };

  concat = (array, item) => {
    const popItem = array[array.length - 1];
    if (popItem === item) return array;
    return array.concat([item]);
  };
}

export default VCSigninWrapper;
