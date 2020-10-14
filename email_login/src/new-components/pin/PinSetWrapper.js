import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';
import Button, { STYLE } from '../templates/Button';
import string from '../../lang';
import './pinsetwrapper.scss';

const { set } = string.pin;

class PinSetWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = props.previousState || {
      pin: '',
      confirmPin: '',
      buttonEnabled: false
    };
  }

  render() {
    return (
      <div className="pin-set-container">
        <div className="back-button" onClick={this.props.onGoBack}>
          <i className="icon-back" />
        </div>
        <h3 className="pin-set-title">{set.title}</h3>
        <div className="pin-set-form">
          <div>
            <h4>{set.new}</h4>
            <ReactCodeInput
              className="pin-code"
              autoFocus={true}
              fieldWidth={30}
              fieldHeight={30}
              fields={4}
              onChange={this.handleChangePin}
              onComplete={this.handleCompletePin}
              type={'password'}
              values={this.state.pin}
            />
          </div>
          <div className="confirm-pin">
            <h4>{set.confirm}</h4>
            <ReactCodeInput
              className="pin-code"
              autoFocus={false}
              fieldWidth={30}
              fieldHeight={30}
              fields={4}
              onChange={this.handleChangePinConfirm}
              onComplete={this.handleCompletePinConfirm}
              type={'password'}
              values={this.state.confirmPin}
            />
          </div>
        </div>
        <div className="button-container">
          <Button
            style={STYLE.CRIPTEXT}
            text={set.button}
            disabled={!this.state.buttonEnabled}
            onClick={this.handleSetPin}
          />
        </div>
      </div>
    );
  }

  handleChangePin = pin => {
    this.setState(
      {
        pin
      },
      this.validatePins
    );
  };

  handleChangePinConfirm = pin => {
    this.setState(
      {
        confirmPin: pin
      },
      this.validatePins
    );
  };

  handleCompletePin = pin => {
    this.setState(
      {
        pin: pin
      },
      this.validatePins
    );
  };

  handleCompletePinConfirm = pin => {
    this.setState(
      {
        confirmPin: pin
      },
      this.validatePins
    );
  };

  validatePins = () => {
    const buttonEnabled =
      this.state.pin.length === 4 &&
      this.state.confirmPin.length === 4 &&
      this.state.pin === this.state.confirmPin;
    this.setState({
      buttonEnabled
    });
  };

  handleSetPin = () => {
    const pin = this.state.pin;
    this.props.onGoTo(
      'save',
      {
        inputPin: pin
      },
      { ...this.state }
    );
  };
}

PinSetWrapper.propTypes = {
  step: PropTypes.string,
  previousState: PropTypes.object,
  onGoBack: PropTypes.func,
  onGoTo: PropTypes.func
};
export default PinSetWrapper;
