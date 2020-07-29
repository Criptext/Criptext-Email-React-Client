import React, { Component } from 'react';
import CustomTextField from '../templates/CustomTextField';
import CustomCheckbox from '../templates/CustomCheckbox';
import OverlayLoader from '../templates/OverlayLoader';
import Button, { STYLE } from '../templates/Button';
import { validateEmail } from '../../validators/validators';
import { checkAvailableRecoveryEmail } from '../../utils/ipc'
import PropTypes from 'prop-types';

import './signupcreateaccount.scss';

class SignUpCreateAccountWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoveryEmail: {
        value: '',
        error: null,
        valid: false
      },
      termsConditions: false,
      promiseCall: false,
      enableButton: false,
      createAccount: false
    };
  }

  render() {
    const recoveryEmail = this.state.recoveryEmail;
    return (
      <div className="signup-create-account-wrapper">
        { this.state.createAccount && <OverlayLoader /> }
        <div className="back-button" onClick={this.props.onGoBack}>
          <i className="icon-back" />
        </div>
        <div className="header-container">
          <h2>
            You’re almost there!
            <br />
            Just two more things 💪
          </h2>
          <div className="subtitle">
            <span>
              Add a recovery email to regain access if you ever forget your
              password
            </span>
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
          <div className="checkbox-container">
            <CustomCheckbox
              value={this.state.termsConditions}
              onChange={this.handleCheckTermsConditions}
            />
            <span className="checkmark-label">
              I have read and agree with the&nbsp;
              <a href={`https://www.criptext.com/en/terms`} target="_blank">
                Terms and Conditions
              </a>
            </span>
          </div>
          <div className="checkbox-container">
            <CustomCheckbox
              value={this.state.promiseCall}
              onChange={this.handleCheckPromiseCall}
            />
            <span className="checkmark-label">
              I promise to call my mom more often
            </span>
          </div>
        </div>
        <Button
          text={'Create Account'}
          style={STYLE.CRIPTEXT}
          disabled={!this.state.enableButton}
          onClick={this.handleCreateAccount}
        />
      </div>
    );
  }

  handleCreateAccount = () => {
    this.setState({
      createAccount: true
    })
  }

  handleCheckTermsConditions = () => {
    const newValue = !this.state.termsConditions;
    this.setState(
      {
        termsConditions: newValue
      },
      this.shouldEnableButton
    );
  };

  handleCheckPromiseCall = () => {
    const newValue = !this.state.promiseCall;
    this.setState(
      {
        promiseCall: newValue
      },
      this.shouldEnableButton
    );
  };

  handleChangeRecoveryEmail = ev => {
    const newEmail = ev.target.value;
    let error = null;
    let isValid = false;
    if (newEmail.includes('@')) {
      isValid = validateEmail(newEmail);
      if (!isValid) {
        error = 'Please enter a valid email';
      } else {
        this.checkRecoveryEmail(newEmail)
      }
    }
    this.setState(
      {
        recoveryEmail: {
          ...this.state.recoveryEmail,
          value: newEmail,
          error,
        }
      },
      this.shouldEnableButton
    );
  };

  checkRecoveryEmail = async email => {
    let res = await checkAvailableRecoveryEmail({
      username: this.props.signupData.username,
      email
    })
    if (email !== this.state.recoveryEmail.value) return;
    const { status } = res;
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
        break;
      default: 
        this.setState(
          {
            recoveryEmail: {
              ...this.state.recoveryEmail,
              error: 'Error Request',
            }
          },
          this.shouldEnableButton
        );
    }
  }

  shouldEnableButton = () => {
    const shouldEnable =
      this.state.recoveryEmail.valid && this.state.termsConditions;
    if (shouldEnable !== this.state.enableButton) {
      this.setState({
        enableButton: shouldEnable
      });
    }
  };
}

export default SignUpCreateAccountWrapper;
