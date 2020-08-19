import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from '../setup/SetupCover';
import CustomCheckbox from '../templates/CustomCheckbox';

import string from '../../lang';
import './pindonewrapper.scss';
import { storeRecoveryKey, sendPin } from '../../utils/ipc';

const { done } = string.pin;

class PinSetWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savePin: true
    };
  }

  render() {
    return (
      <SetupCover
        onGoBack={this.props.onGoBack}
        topButton={done.button}
        title={done.title}
        onClickTopButton={this.handleNext}
      >
        <div className="checkbox-container">
          <CustomCheckbox
            value={this.state.savePin}
            onChange={this.handleCheckSavePin}
          />
          <span className="checkmark-label">{done.checkbox}</span>
        </div>
        <div className="done-image" />
      </SetupCover>
    );
  }

  handleCheckSavePin = () => {
    this.setState({
      savePin: !this.state.savePin
    });
  };

  handleNext = async () => {
    try {
      const { salt, iv, encryptedPin } = this.props.storeData.recoveryKeyData;
      const pin =
        this.props.storeData.inputPin || this.props.storeData.defaultPin;
      console.log('Data : ', {
        pin,
        salt,
        iv,
        encryptedPin,
        shouldSave: this.state.savePin
      });
      await storeRecoveryKey({
        salt,
        iv,
        encryptedPin
      });
      console.log('HEY');
      await sendPin({
        pin: pin,
        shouldSave: this.state.savePin,
        shouldExport: false,
        shouldOnlySetPIN: true,
        shouldResetPin: true,
        dontRestartApp: true
      });
      console.log('HO');
      this.props.onNext();
    } catch (ex) {
      console.log(ex);
    }
  };
}

PinSetWrapper.propTypes = {
  step: PropTypes.string
};
export default PinSetWrapper;
