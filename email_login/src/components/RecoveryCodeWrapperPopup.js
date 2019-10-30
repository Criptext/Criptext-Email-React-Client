import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RecoveryCodePopup from './RecoveryCodePopup';
import string from './../lang';
import { ButtonState } from './Button';

import { sendRecoveryCode, validateRecoveryCode } from '../utils/ipc.js';
import { appDomain } from '../utils/const';

const { recoveryCode } = string.popUp;

class RecoveryCodeWrapperPopup extends Component {
  constructor() {
    super();
    this.state = {
      valueInputCode: '',
      errorInputCode: null,
      codeAlreadySent: false,
      validateButtonState: ButtonState.ENABLED,
      recoveryEmail: null
    };
  }

  render() {
    return (
      <RecoveryCodePopup
        valueInputCode={this.state.valueInputCode}
        errorInputCode={this.state.errorInputCode}
        onClickCancel={this.handleClickCancel}
        onClickConfirm={this.handleClickOkay}
        onInputCodeChange={this.handleInputCodeChange}
        codeAlreadySent={this.state.codeAlreadySent}
        validateButtonState={this.state.validateButtonState}
        onKeyDown={this.handleKeyDown}
        recoveryEmail={this.state.recoveryEmail}
      />
    );
  }

  componentDidMount() {
    this.handleSendCode();
  }

  handleKeyDown = ev => {
    if (ev.key !== 'Enter') {
      return;
    }
    this.handleClickOkay();
  };

  handleInputCodeChange = ev => {
    const value = ev.target.value;
    this.setState({
      valueInputCode: value
    });
  };

  handleSendCode = () => {
    const [recipientId, domain = appDomain] = this.props.emailAddress.split(
      '@'
    );
    this.setState(
      {
        resendRecoveryCodeEnable: false
      },
      async () => {
        const res = await sendRecoveryCode({
          jwt: this.props.jwt,
          newDeviceData: {
            recipientId,
            domain
          }
        });
        const { status } = res;
        switch (status) {
          case 200:
            this.setState({
              recoveryEmail: res.body.address
            });
            return;
          case 400:
            this.setState({
              codeAlreadySent: true,
              recoveryEmail: res.body.address
            });
            return;
          default:
            this.setState({
              errorInputCode: recoveryCode.errors.unknown
            });
            return;
        }
      }
    );
  };

  handleClickCancel = () => {
    this.props.onDismiss();
  };

  handleClickOkay = async () => {
    if (this.state.valueInputCode.length === 0) {
      return;
    }
    this.setState({
      errorInputCode: null,
      validateButtonState: ButtonState.DISABLED
    });
    const [recipientId, domain = appDomain] = this.props.emailAddress.split(
      '@'
    );
    const { status, body } = await validateRecoveryCode({
      jwt: this.props.jwt,
      newDeviceData: {
        recipientId,
        domain,
        code: this.state.valueInputCode
      }
    });
    switch (status) {
      case 200:
        this.props.onCodeValidationSuccess(body);
        return;
      case 400:
        this.setState({
          errorInputCode: recoveryCode.errors.wrong,
          validateButtonState: ButtonState.ENABLED
        });
        return;
      default:
        this.setState({
          errorInputCode: recoveryCode.errors.unknown,
          validateButtonState: ButtonState.ENABLED
        });
        return;
    }
  };
}

// eslint-disable-next-line fp/no-mutation
RecoveryCodeWrapperPopup.propTypes = {
  jwt: PropTypes.string,
  emailAddress: PropTypes.string,
  onDismiss: PropTypes.func,
  onCodeValidationSuccess: PropTypes.func
};

export default RecoveryCodeWrapperPopup;
