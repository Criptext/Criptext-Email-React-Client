import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';
import Button, { ButtonTypes, ButtonStatus } from './Button';
import { checkPin, validatePin } from '../utils/ipc';
import string from './../lang';
import './changesecuritypin.scss';

const page_pin_new = string.popups.security_pin.new_pin;

class ChangeSecurityPin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasErrorZero: false,
      hasErrorFirst: false,
      hasErrorSecond: false,
      buttonState: ButtonStatus.DISABLED,
      firstPin: '',
      isPINSaved: true
    };
    this.firstPin = undefined;
    this.secondPin = undefined;
  }

  render() {
    return (
      <section>
        <div className="pin-new-content">
          <h1>{page_pin_new.title}</h1>
          <p>{page_pin_new.description}</p>
          <div
            className={
              this.state.isPINSaved ? 'pin-new-code expand' : 'pin-new-code'
            }
          >
            {!this.state.isPINSaved && (
              <div
                className={
                  this.state.hasErrorZero
                    ? 'pin-code pin-code-status-error'
                    : 'pin-code'
                }
              >
                <h2>{page_pin_new.current_pin}</h2>
                <ReactCodeInput
                  autoFocus={true}
                  fieldWidth={32}
                  fieldHeight={35}
                  fields={4}
                  onChange={value => this.handleChange(value, 1)}
                  onComplete={value => this.handleComplete(value, 0)}
                  type={'password'}
                />
                {this.state.hasErrorZero && (
                  <span className="error">{page_pin_new.error_pin}</span>
                )}
              </div>
            )}
            <div
              className={
                this.state.hasErrorFirst
                  ? 'pin-code pin-code-status-error'
                  : 'pin-code'
              }
            >
              <h2>{page_pin_new.new_pin}</h2>
              <ReactCodeInput
                autoFocus={false}
                fieldWidth={32}
                fieldHeight={35}
                fields={4}
                onChange={value => this.handleChange(value)}
                onComplete={value => this.handleComplete(value, 1)}
                type={'password'}
              />
              {this.state.hasErrorFirst && (
                <span className="error">{page_pin_new.error_number}</span>
              )}
            </div>
            <div
              className={
                this.state.hasErrorSecond
                  ? 'pin-code pin-code-status-error'
                  : 'pin-code'
              }
            >
              <h2>{page_pin_new.confirm_pin}</h2>
              <ReactCodeInput
                autoFocus={false}
                fieldWidth={32}
                fieldHeight={35}
                fields={4}
                onChange={value => this.handleChange(value)}
                onComplete={value => this.handleComplete(value, 2)}
                type={'password'}
              />
              {this.state.hasErrorSecond && (
                <span className="error">{page_pin_new.error_match}</span>
              )}
            </div>
          </div>
          <Button
            onClick={this.handleClickSetPin}
            status={this.state.buttonState}
            text={page_pin_new.button}
            type={ButtonTypes.PRIMARY}
          />
        </div>
      </section>
    );
  }

  async componentDidMount() {
    const isPINSaved = await checkPin();
    if (!isPINSaved) this.setState({ isPINSaved });
  }

  handleChange = (value, index) => {
    if (index) {
      if (value.length !== 4) this.setState({ hasErrorZero: false });
    } else {
      const n = value.length - 1;
      const isNumber = Number(value[n]) >= 0;
      if (!isNumber && value) {
        this.setState({
          hasErrorFirst: true,
          buttonState: ButtonStatus.DISABLED
        });
      } else {
        this.setState({ hasErrorFirst: false });
      }
    }
    if (value.length !== 4) {
      this.setState({ buttonState: ButtonStatus.DISABLED });
    }
  };

  handleComplete = async (value, index) => {
    if (index === 0) {
      const isValidPin = await validatePin(value);
      if (isValidPin) {
        this.setState({ hasErrorZero: false });
      } else {
        this.setState({ hasErrorZero: true });
      }
    } else if (index === 1) {
      this.firstPin = value;
    } else {
      this.secondPin = value;
    }

    if (this.firstPin && this.secondPin) {
      if (
        this.firstPin === this.secondPin &&
        !this.state.hasErrorFirst &&
        !this.state.hasErrorZero
      ) {
        this.setState({
          hasErrorSecond: false,
          buttonState: ButtonStatus.SELECT
        });
      } else {
        this.setState({
          hasErrorSecond: true,
          buttonState: ButtonStatus.DISABLED
        });
      }
    }
  };

  handleClickSetPin = () => {
    this.props.onClickSetPin(this.secondPin);
  };
}

ChangeSecurityPin.propTypes = {
  onClickSetPin: PropTypes.func
};

export default ChangeSecurityPin;
