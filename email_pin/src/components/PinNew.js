import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';
import Button, { ButtonType, ButtonState } from './Button';
import string from './../lang';
import './pinnew.scss';

const { page_pin_new } = string;

class PinNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasErrorFirst: false,
      hasErrorSecond: false,
      buttonState: ButtonState.DISABLED,
      firstPin: ''
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
          <div className="pin-new-code">
            <div
              className={
                this.state.hasErrorFirst
                  ? 'pin-code pin-code-status-error'
                  : 'pin-code'
              }
            >
              <h2>{page_pin_new.new_pin}</h2>
              <ReactCodeInput
                autoFocus={true}
                fieldWidth={32}
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
            state={this.state.buttonState}
            text={page_pin_new.button}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }

  handleChange = value => {
    const n = value.length - 1;
    const isNumber = Number(value[n]) >= 0;
    if (!isNumber && value) {
      this.setState({ hasErrorFirst: true, buttonState: ButtonState.DISABLED });
    } else {
      this.setState({ hasErrorFirst: false });
    }
    if (value.length !== 4) {
      this.setState({ buttonState: ButtonState.DISABLED });
    }
  };

  handleComplete = (value, index) => {
    if (index === 1) {
      this.firstPin = value;
    } else {
      this.secondPin = value;
    }

    if (this.firstPin && this.secondPin) {
      if (this.firstPin === this.secondPin && !this.state.hasErrorFirst) {
        this.setState({
          hasErrorSecond: false,
          buttonState: ButtonState.SELECT
        });
      } else {
        this.setState({
          hasErrorSecond: true,
          buttonState: ButtonState.DISABLED
        });
      }
    }
  };

  handleClickSetPin = () => {
    this.props.onClickSetPin(this.secondPin);
  };
}

PinNew.propTypes = {
  onClickSetPin: PropTypes.func
};

export default PinNew;
