import React, { Component } from 'react';
import CustomTextField from '../templates/CustomTextField';
import Button, { STYLE } from '../templates/Button';
import { validateEmail } from '../../validators/validators';
import { checkAvailableRecoveryEmail } from '../../utils/ipc';
import string from '../../lang';
import PropTypes from 'prop-types';

import './recoveryemailform.scss';

const { recovery } = string.newSignUp;

class RecoveryEmailFormWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = props.previousState || {
      recoveryEmail: {
        value: '',
        error: null,
        valid: false
      },
      enableButton: false
    };
  }

  render() {
    const recoveryEmail = this.state.recoveryEmail;
    return (
      <div className="signup-recovery-wrapper">
        <div className="back-button" onClick={this.props.onGoBack}>
          <i className="icon-back" />
        </div>
        <div className="header-container">
          <h2>
            {recovery.title.firstLine}
            <br />
            {recovery.title.secondLine}
          </h2>
          <div className="subtitle">
            <span>{recovery.description}</span>
          </div>
        </div>
        <div className="form-container">
          <CustomTextField
            id="signup-recovery-email"
            label="Recovery Email"
            type="email"
            value={recoveryEmail.value}
            error={!!recoveryEmail.error}
            onChange={this.handleChangeRecoveryEmail}
            helperText={recoveryEmail.error ? recoveryEmail.error : undefined}
          />
        </div>
        <Button
          text={recovery.button}
          style={STYLE.CRIPTEXT}
          disabled={!this.state.enableButton}
          onClick={this.handleNext}
        />
      </div>
    );
  }

  handleNext = () => {
    this.props.onGoTo(
      'create',
      {
        recoveryEmail: this.state.recoveryEmail.value
      },
      {
        ...this.state
      }
    );
  };

  handleChangeRecoveryEmail = ev => {
    const newEmail = ev.target.value;
    let error = null;
    let isValid = false;
    if (newEmail.includes('@')) {
      isValid = validateEmail(newEmail);
      if (!isValid) {
        error = recovery.recovery.errors.invalid;
      } else {
        this.checkRecoveryEmail(newEmail);
      }
    }
    this.setState(
      {
        recoveryEmail: {
          ...this.state.recoveryEmail,
          value: newEmail,
          error
        }
      },
      this.shouldEnableButton
    );
  };

  checkRecoveryEmail = async email => {
    const res = await checkAvailableRecoveryEmail({
      username: this.props.signupData.username,
      email
    });
    if (email !== this.state.recoveryEmail.value) return;
    const { status } = res;
    let requestError = '';
    switch (status) {
      case 200:
        this.setState(
          {
            recoveryEmail: {
              ...this.state.recoveryEmail,
              valid: true
            }
          },
          this.shouldEnableButton
        );
        return;
      case 405: {
        const { error, data } = res.body;
        switch (error) {
          case 1:
            requestError = recovery.recovery.errors.notConfirmed;
            break;
          case 2:
            requestError = string.formatString(
              recovery.recovery.errors.maxUses,
              data.max
            );
            break;
          case 3:
            requestError = recovery.recovery.errors.blacklisted;
            break;
          case 5:
            requestError = recovery.recovery.errors.same;
            break;
          default:
            requestError = string.formatString(
              recovery.recovery.errors.default,
              error
            );
            break;
        }
        break;
      }
      default:
        requestError = string.formatString(
          recovery.recovery.errors.default,
          status
        );
        break;
    }
    this.setState(
      {
        recoveryEmail: {
          ...this.state.recoveryEmail,
          error: requestError
        }
      },
      this.shouldEnableButton
    );
  };

  shouldEnableButton = () => {
    const shouldEnable = this.state.recoveryEmail.valid;
    if (shouldEnable !== this.state.enableButton) {
      this.setState({
        enableButton: shouldEnable
      });
    }
  };
}

RecoveryEmailFormWrapper.propTypes = {
  previousState: PropTypes.object,
  signupData: PropTypes.object,
  onGoBack: PropTypes.func,
  onGoTo: PropTypes.func
};

export default RecoveryEmailFormWrapper;
