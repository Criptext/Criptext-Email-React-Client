import React, { Component } from 'react';
import CustomTextField from '../templates/CustomTextField';
import CustomCheckbox from '../templates/CustomCheckbox';
import OverlayLoader from '../templates/OverlayLoader';
import ErrorPopup from '../templates/ErrorPopup';
import PopupHOC from '../templates/PopupHOC';
import Button, { STYLE } from '../templates/Button';
import { validateEmail } from '../../validators/validators';
import { checkAvailableRecoveryEmail } from '../../utils/ipc';
import { createAccount } from '../../signal/signup';
import { getPin } from '../../utils/electronInterface';
import string, { getLang } from '../../lang';
import PropTypes from 'prop-types';

import './signupcreateaccount.scss';

const { create } = string.newSignUp;

const ErrorPop = PopupHOC(ErrorPopup);

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
      createAccount: false,
      error: undefined
    };
  }

  render() {
    const recoveryEmail = this.state.recoveryEmail;
    return (
      <div className="signup-create-account-wrapper">
        {this.state.createAccount && <OverlayLoader />}
        {this.state.error && (
          <ErrorPop
            {...this.state.error}
            onClickDismiss={this.handleDismissPopup}
          />
        )}
        <div className="back-button" onClick={this.props.onGoBack}>
          <i className="icon-back" />
        </div>
        <div className="header-container">
          <h2>
            {create.title.firstLine}
            <br />
            {create.title.secondLine}
          </h2>
          <div className="subtitle">
            <span>{create.description}</span>
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
              {string.formatString(
                create.terms,
                <a
                  href={`https://www.criptext.com/${getLang}/terms`}
                  target="_blank"
                >
                  {create.link}
                </a>
              )}
            </span>
          </div>
          <div className="checkbox-container">
            <CustomCheckbox
              value={this.state.promiseCall}
              onChange={this.handleCheckPromiseCall}
            />
            <span className="checkmark-label">{create.lifeTip}</span>
          </div>
        </div>
        <Button
          text={create.button}
          style={STYLE.CRIPTEXT}
          disabled={!this.state.enableButton}
          onClick={this.handleCreateAccount}
        />
      </div>
    );
  }

  handleCreateAccount = () => {
    this.setState(
      {
        createAccount: true
      },
      this.processCreateAccount
    );
  };

  processCreateAccount = async () => {
    const { username, fullname, password } = this.props.signupData;
    try {
      const newAccount = await createAccount({
        recipientId: username,
        password,
        name: fullname,
        recoveryEmail: this.state.recoveryEmail.value
      });
      const nextSection = getPin() ? 'ready' : 'created';
      this.props.onGoTo(nextSection, {
        recoveryEmail: this.state.recoveryEmail.value,
        id: newAccount.accountId
      });
    } catch (ex) {
      console.error(ex);
      this.setState({
        createAccount: false,
        error: {
          title: create.errors.title,
          button: create.errors.button,
          message: ex.message
        }
      });
    }
  };

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
        error = create.recovery.errors.invalid;
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
    let res = await checkAvailableRecoveryEmail({
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
            requestError = create.recovery.errors.notConfirmed;
            break;
          case 2:
            requestError = string.formatString(
              create.recovery.errors.maxUses,
              data.max
            );
            break;
          case 3:
            requestError = create.recovery.errors.blacklisted;
            break;
          case 5:
            requestError = create.recovery.errors.same;
            break;
          default:
            requestError = string.formatString(
              create.recovery.errors.default,
              error
            );
            break;
        }
        break;
      }
      default:
        requestError = string.formatString(
          create.recovery.errors.default,
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
    const shouldEnable =
      this.state.recoveryEmail.valid && this.state.termsConditions;
    if (shouldEnable !== this.state.enableButton) {
      this.setState({
        enableButton: shouldEnable
      });
    }
  };

  handleDismissPopup = () => {
    this.setState({
      error: undefined
    });
  };
}

export default SignUpCreateAccountWrapper;
