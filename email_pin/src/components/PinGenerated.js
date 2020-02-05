import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import './pingenerated.scss';

const { page_pin_generated } = string;

class PinGenerated extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonText: page_pin_generated.options.keep_it.title,
      radioButtonSelected: 'KeepIt'
    };
  }

  render() {
    return (
      <section id="pin-generated-container">
        <div className="pin-generated-content">
          <h1>{page_pin_generated.title}</h1>
          <p>{page_pin_generated.description}</p>
          <span className="pin-generated-code">{this.props.pin}</span>
          <div className="pin-generated-options">
            <div className="pin-generated-option">
              <input
                type="radio"
                value="KeepIt"
                onChange={e => this.onClickRadio(e)}
                checked={this.state.radioButtonSelected === 'KeepIt'}
              />
              <div>
                <h2>{page_pin_generated.options.keep_it.title}</h2>
                <p>{page_pin_generated.options.keep_it.description}</p>
              </div>
            </div>
            <div className="pin-generated-option">
              <input
                type="radio"
                value="ChangeIt"
                onChange={e => this.onClickRadio(e)}
                checked={this.state.radioButtonSelected === 'ChangeIt'}
              />
              <div>
                <h2>{page_pin_generated.options.change_it.title}</h2>
                <p>{page_pin_generated.options.change_it.description}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={
              this.state.radioButtonSelected === 'KeepIt'
                ? this.props.onClickKeepIt
                : this.props.onClickChangeIt
            }
            state={this.props.buttonState}
            text={this.state.buttonText}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }

  onClickRadio = e => {
    const value = e.target.value;
    const buttonText =
      value === 'KeepIt'
        ? page_pin_generated.options.keep_it.title
        : page_pin_generated.options.change_it.title;
    this.setState({
      radioButtonSelected: value,
      buttonText
    });
  };
}

PinGenerated.propTypes = {
  buttonState: PropTypes.string,
  onClickChangeIt: PropTypes.func,
  onClickKeepIt: PropTypes.func,
  pin: PropTypes.string
};

export default PinGenerated;
