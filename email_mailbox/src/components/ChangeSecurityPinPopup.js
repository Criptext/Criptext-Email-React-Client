import React, { Component } from 'react';
import ChangeSecurityPin from './ChangeSecurityPin';
import SaveRecoveryKey from './SaveRecoveryKey';
import PinSetupComplete from './PinSetupComplete';
import { encryptPin } from '../utils/AESUtils';
import { startRekey } from '../utils/ipc';

const STEP = {
  INPUT_NEW_PIN: 'input-new-pin',
  RECOVERY_KEY: 'recovery_key',
  DONE: 'done'
};

class ChangeSecurityPinPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputPin: undefined,
      step: STEP.INPUT_NEW_PIN,
      recoveryKeyData: undefined,
      saveInKeyChain: true
    };
  }

  render() {
    switch (this.state.step) {
      case STEP.INPUT_NEW_PIN:
        return <ChangeSecurityPin onClickSetPin={this.handleSetPin} />;
      case STEP.RECOVERY_KEY:
        return (
          <SaveRecoveryKey
            recoveryKey={this.state.recoveryKeyData.recoveryKey}
            onClickContinue={this.handleContinue}
          />
        );
      case STEP.DONE:
        return (
          <PinSetupComplete
            askKeyChain={true}
            saveInKeyChain={this.state.saveInKeyChain}
            onClickCompleteSetup={this.handleCompleteSetup}
            onChangeSaveInKeyChain={this.handleChangeSaveInKeyChain}
          />
        );
      default:
        return <div />;
    }
  }

  handleSetPin = async pin => {
    const recoveryKeyData = await encryptPin(pin);
    this.setState({
      inputPin: pin,
      step: STEP.RECOVERY_KEY,
      recoveryKeyData
    });
  };

  handleContinue = () => {
    this.setState({
      step: STEP.DONE
    });
  };

  handleCompleteSetup = () => {
    startRekey({
      recoveryKeyData: this.state.recoveryKeyData,
      newPin: this.state.inputPin,
      saveInKeyChain: this.state.saveInKeyChain
    });
  };

  handleChangeSaveInKeyChain = value => {
    this.setState({
      saveInKeyChain: value
    });
  };
}

export default ChangeSecurityPinPopup;
