import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from './SetupCover';
import './verifyrecoveryemailwrapper.scss';
import { canSend, resendConfirmationEmail } from '../../utils/ipc';
import string from '../../lang';

const { recovery } = string.setup;

class VerifyRecoveryEmailWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verified: false,
      timer: 0
    };
    this.recoveryEmailChecker = undefined;
    this.resendTimer = undefined;
  }

  render() {
    const sendText = this.state.verified
      ? recovery.button
      : this.state.timer <= 0
        ? recovery.resend
        : string.formatString(recovery.resendTime, this.state.timer);
    return (
      <SetupCover
        {...this.props}
        title={recovery.title}
        topButton={sendText}
        bottomButton={string.setup.skip}
        onClickTopButton={
          this.state.verified
            ? this.handleNext
            : this.handleResendConfirmationEmail
        }
        topButtonDisabled={!this.state.verified && this.state.timer > 0}
      >
        <div className="setup-verify">
          <div className="verify-container">
            <span>Verification link sent to:</span>
            <span className="verify-email">{this.props.account.recoveryEmail}</span>
            {this.state.verified && (
              <span className="verify-status">(verified!)</span>
            )}
          </div>
        </div>
      </SetupCover>
    );
  }

  componentDidMount() {
    this.recoveryEmailChecker = setInterval(this.checkCanSend, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.recoveryEmailChecker);
    clearInterval(this.resendTimer);
  }

  checkCanSend = async () => {
    const res = await canSend({
      recipientId: this.props.account.username
    });
    if (res && res.status === 200) {
      clearInterval(this.recoveryEmailChecker);
      this.setState({
        verified: true
      });
    }
  };

  handleResendConfirmationEmail = () => {
    resendConfirmationEmail({
      recipientId: this.props.account.username
    });
    this.setState(
      {
        timer: 20
      },
      () => {
        this.resendTimer = setInterval(() => {
          const newTimer = this.state.timer - 1;
          if (newTimer <= 0) {
            clearInterval(this.resendTimer);
          }
          this.setState({
            timer: newTimer
          });
        }, 1000);
      }
    );
  };

  handleNext = () => {
    this.props.onGoTo('backup');
  };
}

VerifyRecoveryEmailWrapper.propTypes = {
  step: PropTypes.string
};
export default VerifyRecoveryEmailWrapper;
