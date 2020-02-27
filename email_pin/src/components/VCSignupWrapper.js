import React, { Component } from 'react';
import ScreenSignup, { step } from './ScreenSignup';
import {
  closePinWindow,
  openCreateKeysLoadingWindow,
  sendPin
} from './../utils/ipc';
import { remoteData } from './../utils/electronInterface';

import VCHOC from './VCHOC';

const VCSignup = VCHOC(ScreenSignup);

class VCSignupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: step.START,
      steps: [step.START]
    };
    this.pin = undefined;
    this.askKeyChain = false;
  }

  render() {
    return (
      <VCSignup
        askKeyChain={this.askKeyChain}
        currentStep={this.state.currentStep}
        onClickBackView={this.handleClickBackView}
        onClickChangeIt={this.handleClickChangeIt}
        onClickCompleteIt={this.handleClickCompleteIt}
        onClickKeepIt={this.handleClickKeepIt}
        onClickSavedIt={this.handleClickSavedIt}
        onClickSetPin={this.handleClickSetPin}
        onClickStart={this.handleClickStart}
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
    this.pin = `${Math.round(Math.random() * 9000) + 1000}`;
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
    await sendPin({
      pin: this.pin,
      shouldSave: value,
      shouldExport: false,
      shouldOnlySetPIN: true
    });
    openCreateKeysLoadingWindow({
      loadingType: 'signup',
      remoteData
    });
    closePinWindow({ forceClose: true });
  };

  concat = (array, item) => {
    const popItem = array[array.length - 1];
    if (popItem === item) return array;
    return array.concat([item]);
  };
}

export default VCSignupWrapper;
