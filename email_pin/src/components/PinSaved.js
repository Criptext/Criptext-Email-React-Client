import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import { encryptAndStorePin } from '../utils/AESUtils';
import './pinsaved.scss';

const { page_pin_saved } = string;

class PinSaved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoveryKey: undefined
    };
    this.textArea = undefined;
  }

  componentDidMount() {
    this.storeRecoveryKey();
  }

  render() {
    return (
      <section>
        <div className="pin-saved-content">
          <h1>{page_pin_saved.title}</h1>
          <p>{page_pin_saved.description}</p>
          <div className="pin-saved-key">
            <h2>{page_pin_saved.copy_recovery_key}</h2>
            <div className="pin-saved-key-block">
              <div className="icon" />
              <input
                defaultValue={this.state.recoveryKey}
                type="text"
                ref={textarea => (this.textArea = textarea)}
              />
              <Button
                onClick={this.copyClipBoard}
                text={page_pin_saved.copy}
                type={ButtonType.BASIC}
              />
            </div>
            <span>
              {page_pin_saved.or}&nbsp;
              <a
                download="criptext-pin.txt"
                href={`data:text/plain,${this.state.recoveryKey}`}
              >
                <b>{page_pin_saved.download}</b>
              </a>&nbsp;
              {page_pin_saved.it_in_a_file}
            </span>
          </div>
          <Button
            onClick={this.props.onClickSavedIt}
            state={this.props.buttonState}
            text={page_pin_saved.button}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }

  storeRecoveryKey = async () => {
    const recoveryKey = await encryptAndStorePin(this.props.pin);
    this.setState({
      recoveryKey
    });
  };

  copyClipBoard = () => {
    this.textArea.select();
    document.execCommand('copy');
  };
}

PinSaved.propTypes = {
  buttonState: PropTypes.string,
  onClickSavedIt: PropTypes.func,
  pin: PropTypes.string
};

export default PinSaved;
