import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';
import Button, { ButtonType, ButtonState } from './Button';
import CustomCheckbox from './CustomCheckbox';
import { validatePin } from '../utils/ipc';
import string from './../lang';
import './enterpin.scss';

const { page_enter_pin } = string;

class EnterPin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      buttonState: ButtonState.DISABLED,
      value: false
    };
    this.pin = props.pin || undefined;
  }

  render() {
    return (
      <section id="enter-pin-containter">
        <div className="enter-pin-content">
          <div className="logo" />
          <h1>{page_enter_pin.title}</h1>
          <div
            className={
              this.state.hasError
                ? 'pin-code pin-code-status-error'
                : 'pin-code'
            }
          >
            <ReactCodeInput
              autoFocus={false}
              fieldWidth={32}
              fields={4}
              onChange={value => this.handleChange(value)}
              onComplete={value => this.handleComplete(value)}
              type={'text'}
              values={this.pin}
            />
            {this.state.hasError && (
              <span className="error">{page_enter_pin.error}</span>
            )}
          </div>
          <h2
            className="enter-ping-content-ask"
            onClick={this.props.onClickForgotPin}
          >
            {page_enter_pin.ask}
          </h2>
          <div className="enter-pin-checkbox-content">
            <div className="enter-pin-checkbox">
              <CustomCheckbox
                value={this.state.value}
                onChange={this.handleChangeCheckbox}
              />
              <h2>{page_enter_pin.checkbox.title}</h2>
            </div>
            <p>{page_enter_pin.checkbox.description}</p>
          </div>
          <Button
            onClick={this.handleClickOpen}
            state={this.state.buttonState}
            text={page_enter_pin.button}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }

  componentDidMount = () => {
    if (this.pin) {
      this.handleComplete(this.pin);
    }
  };

  handleChange = value => {
    if (value.length !== 4) {
      this.setState({ hasError: false, buttonState: ButtonState.DISABLED });
    }
  };

  handleChangeCheckbox = value => {
    this.setState({ value });
  };

  handleComplete = async value => {
    this.pin = value;
    const isValidPin = await validatePin(value);
    if (isValidPin) {
      this.setState({ hasError: false, buttonState: ButtonState.ENABLED });
    } else {
      this.setState({ hasError: true, buttonState: ButtonState.DISABLED });
    }
  };

  handleClickOpen = () => {
    this.props.onClickOpen({ shouldSave: this.state.value, pin: this.pin });
  };
}

EnterPin.propTypes = {
  buttonState: PropTypes.string,
  onClickForgotPin: PropTypes.func,
  onClickOpen: PropTypes.func,
  pin: PropTypes.string.optional
};

export default EnterPin;
