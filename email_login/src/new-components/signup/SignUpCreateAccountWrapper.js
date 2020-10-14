import React, { Component } from 'react';
import CustomCheckbox from '../templates/CustomCheckbox';
import OverlayLoader from '../templates/OverlayLoader';
import ErrorPopup from '../templates/ErrorPopup';
import PopupHOC from '../templates/PopupHOC';
import Button, { STYLE } from '../templates/Button';
import { sendPin, logLocal } from '../../utils/ipc';
import { createAccount } from '../../signal/signup';
import { getPin, DEFAULT_PIN, hasPin } from '../../utils/electronInterface';
import string, { getLang } from '../../lang';
import PropTypes from 'prop-types';

import './signupcreateaccount.scss';

const { create } = string.newSignUp;

const ErrorPop = PopupHOC(ErrorPopup);

class SignUpCreateAccountWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      termsConditions: false,
      promiseCall: false,
      enableButton: false,
      createAccount: false,
      error: undefined
    };
  }

  render() {
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
                  rel="noreferrer noopener"
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
    const {
      username,
      fullname,
      password,
      recoveryEmail
    } = this.props.signupData;
    try {
      const hasPIN = hasPin();
      if (!hasPIN)
        await sendPin({
          pin: DEFAULT_PIN,
          shouldSave: false,
          shouldExport: false,
          shouldOnlySetPIN: true
        });
      const newAccount = await createAccount({
        recipientId: username,
        password,
        name: fullname,
        recoveryEmail
      });
      const nextSection = getPin() ? 'ready' : 'created';
      this.props.onGoTo(nextSection, {
        recoveryEmail,
        id: newAccount.accountId
      });
    } catch (ex) {
      logLocal(ex.stack);
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

  shouldEnableButton = () => {
    const shouldEnable = this.state.termsConditions;
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

SignUpCreateAccountWrapper.propTypes = {
  signupData: PropTypes.object,
  onGoBack: PropTypes.func,
  onGoTo: PropTypes.func
};

export default SignUpCreateAccountWrapper;
