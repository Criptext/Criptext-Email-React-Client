import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from '../setup/SetupCover';
import { encryptPin } from '../../utils/AESUtils';

import string from '../../lang';
import './savekeywrapper.scss';

const { key } = string.pin;

class PinSetWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoveryKeyData: {}
    };
    this.textArea = undefined;
  }

  render() {
    const { recoveryKey = '' } = this.state.recoveryKeyData;
    return (
      <SetupCover
        onGoBack={this.props.onGoBack}
        topButton={key.button}
        title={key.title}
        onClickTopButton={this.handleNext}
        className="pin-save-key"
      >
        <div className="pin-save-subtitle">
          <span>{key.message}</span>
        </div>
        <div className="pin-saved-key">
          <h2>{key.recovery.title}</h2>
          <div className="pin-saved-key-block">
            <div className="icon" />
            <input
              defaultValue={recoveryKey}
              type="text"
              ref={textarea => (this.textArea = textarea)}
            />
            <button onClick={this.copyClipBoard}>{key.recovery.button}</button>
          </div>
          <span>
            {key.recovery.link.or}&nbsp;
            <a
              download="criptext-pin.txt"
              href={`data:text/plain,${recoveryKey}`}
            >
              <b>{key.recovery.link.download}</b>
            </a>&nbsp;
            {key.recovery.link.it}
          </span>
        </div>
      </SetupCover>
    );
  }

  async componentDidMount() {
    const pin =
      this.props.storeData.inputPin || this.props.storeData.defaultPin;
    const recoveryKeyData = await encryptPin(pin);
    this.setState({
      recoveryKeyData
    });
  }

  handleNext = () => {
    this.props.onGoTo('done', {
      recoveryKeyData: { ...this.state.recoveryKeyData }
    });
  };

  copyClipBoard = () => {
    this.textArea.select();
    document.execCommand('copy');
  };
}

PinSetWrapper.propTypes = {
  step: PropTypes.string
};
export default PinSetWrapper;
