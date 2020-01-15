import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonTypes } from './Button';
import string from './../lang';
import './saverecoverykey.scss';

const page_pin_saved = string.popups.security_pin.recovery_key;

class SaveRecoveryKey extends Component {
  render() {
    return (
      <section>
        <div className="pin-saved-content">
          <h1>{page_pin_saved.title}</h1>
          <p>{page_pin_saved.description}</p>
          <div className="pin-saved-key">
            <h2>{page_pin_saved.copy_code}</h2>
            <div className="pin-saved-key-block">
              <div className="icon" />
              <input
                defaultValue={this.props.recoveryKey}
                type="text"
                ref={textarea => (this.textArea = textarea)}
              />
              <Button
                onClick={this.copyClipBoard}
                text={page_pin_saved.copy}
                type={ButtonTypes.PRIMARY}
              />
            </div>
            <span>
              {page_pin_saved.or}&nbsp;
              <a
                download="criptext-pin.txt"
                href={`data:text/plain,${this.props.recoveryKey}`}
              >
                <b>{page_pin_saved.download}</b>
              </a>&nbsp;
              {page_pin_saved.it_in_a_file}
            </span>
          </div>
          <Button
            onClick={this.props.onClickContinue}
            state={this.props.buttonState}
            text={page_pin_saved.button}
            type={ButtonTypes.PRIMARY}
          />
        </div>
      </section>
    );
  }

  copyClipBoard = () => {
    this.textArea.select();
    document.execCommand('copy');
  };
}

SaveRecoveryKey.propTypes = {
  buttonState: PropTypes.string,
  onClickContinue: PropTypes.func,
  recoveryKey: PropTypes.string
};

export default SaveRecoveryKey;
