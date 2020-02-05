import React, { Component } from 'react';
import ScreenEnterPin, { step } from './ScreenEnterPin';
import { upApp } from './../utils/ipc';
import VCHOC from './VCHOC';

const VCSignin = VCHOC(ScreenEnterPin);

class VCNewPinWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: step.ENTER_PIN,
      steps: [step.ENTER_PIN],
      recoveredPin: undefined
    };
    this.askKeyChain = false;
  }

  render() {
    return (
      <VCSignin
        askKeyChain={this.askKeyChain}
        currentStep={this.state.currentStep}
        onClickBackView={this.handleClickBackView}
        onClickForgotPin={this.handleClickForgotPin}
        onClickOpen={this.handleClickOpen}
        onClickSetPin={this.handleSetPin}
        recoveredPin={this.state.recoveredPin}
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

  handleClickForgotPin = () => {
    this.setState(state => ({
      steps: this.concat(state.steps, step.ENTER_RECOVERY_KEY),
      currentStep: step.ENTER_RECOVERY_KEY
    }));
  };

  handleClickOpen = ({ shouldSave, pin }) => {
    upApp({ shouldSave, pin });
  };

  handleSetPin = pin => {
    this.setState({
      currentStep: step.ENTER_PIN,
      steps: [step.ENTER_PIN],
      recoveredPin: pin
    });
  };

  concat = (array, item) => {
    const popItem = array[array.length - 1];
    if (popItem === item) return array;
    return array.concat([item]);
  };
}

export default VCNewPinWrapper;
