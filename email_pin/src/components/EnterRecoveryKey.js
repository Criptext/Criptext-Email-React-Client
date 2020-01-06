import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import { decryptPin } from '../utils/AESUtils';
import { getRecoveryKey } from '../utils/ipc';
import './enterrecoverykey.scss';

const { page_enter_recovery_key } = string;

const ERROR_TYPE = {
  INPUT: 'input',
  FILE: 'file'
};

class EnterRecoveryKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoveryKey: '',
      uploadedFile: undefined,
      error: undefined
    };
  }

  render() {
    return (
      <section>
        <div className="enter-recovery-key-content">
          <h1>{page_enter_recovery_key.title}</h1>
          <p>{page_enter_recovery_key.description}</p>
          <div className="enter-recovery-key">
            <h2>{page_enter_recovery_key.enter_key}</h2>
            <div className="enter-recovery-key-block">
              <div className="icon" />
              <input
                onChange={this.onChangeInput}
                value={this.state.recoveryKey}
                type="text"
                disabled={!!this.state.uploadedFile}
              />
              {this.state.error &&
                this.state.error.type === ERROR_TYPE.INPUT && (
                  <div className="enter-recovery-key-error">
                    <span>{this.state.error.message}</span>
                  </div>
                )}
            </div>
            <div className="enter-recovery-key-upload-wrapper">
              <span>{page_enter_recovery_key.or}</span>&nbsp;
              <div>
                <label htmlFor="enter-recovery-key-upload">
                  <b>{page_enter_recovery_key.upload}</b>
                </label>
                <input
                  id="enter-recovery-key-upload"
                  onChange={this.onChangeFile}
                  type="file"
                />
              </div>{' '}
              &nbsp;
              <span>{page_enter_recovery_key.recovery_file}</span>
            </div>
            {this.state.uploadedFile && (
              <div className="enter-recovery-file">
                <div className="file-content-icon">
                  <i className="icon-file-default" />
                </div>
                <label>{this.state.uploadedFile.name}</label>
                <i className="icon-exit" onClick={this.onRemoveFile} />
                {this.state.error &&
                  this.state.error.type === ERROR_TYPE.FILE && (
                    <div className="enter-recovery-key-error">
                      <span>{this.state.error.message}</span>
                    </div>
                  )}
              </div>
            )}
          </div>
          <Button
            onClick={this.handleForgotPin}
            text={page_enter_recovery_key.button}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }

  onChangeInput = e => {
    e.preventDefault();
    this.setState({
      recoveryKey: e.target.value,
      error: undefined
    });
  };

  onChangeFile = e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    e.target.value = null;
    this.setState({
      uploadedFile: file,
      error: undefined,
      recoveryKey: ''
    });
  };

  onRemoveFile = e => {
    e.preventDefault();
    this.setState({
      uploadedFile: undefined,
      error: undefined
    });
  };

  handleForgotPin = () => {
    if (this.state.recoveryKey) {
      this.handleDecryptPin(this.state.recoveryKey, ERROR_TYPE.INPUT);
    } else if (this.state.uploadedFile) {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const recoveryKey = reader.result;
        this.handleDecryptPin(recoveryKey.trim(), ERROR_TYPE.FILE);
      });
      reader.readAsText(this.state.uploadedFile);
    } else {
      this.setState({
        error: {
          message: page_enter_recovery_key.error.empty,
          type: ERROR_TYPE.INPUT
        }
      });
    }
  };

  handleDecryptPin = async (recoveryKey, source) => {
    try {
      const decryptData = await getRecoveryKey();
      if (!decryptData) throw new Error('unable to retrieve data');
      const pin = await decryptPin({
        ...decryptData,
        recoveryKey
      });
      if (!pin) throw new Error('unable to decrypt pin');
      this.props.onClickSetPin(pin);
    } catch (ex) {
      this.setState({
        error: {
          message:
            source === ERROR_TYPE.FILE
              ? page_enter_recovery_key.error.file
              : page_enter_recovery_key.error.key,
          type: source
        }
      });
    }
  };
}

EnterRecoveryKey.propTypes = {
  onClickSetPin: PropTypes.func
};

export default EnterRecoveryKey;
