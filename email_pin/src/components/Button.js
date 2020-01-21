import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './button.scss';

class Button extends Component {
  render() {
    return (
      <button
        ref={e => (this.button = e)}
        className={this.defineClassButton(this.props.type, this.props.state)}
        disabled={this.defineDisabledParam(this.props.state)}
        onClick={e => this.props.onClick(e, this.props.id)}
      >
        {this.renderContentButton(this.props.state, this.props.text)}
        &nbsp;
      </button>
    );
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.state !== ButtonState.SELECT &&
      this.props.state === ButtonState.SELECT
    ) {
      this.button.focus();
    }
  }

  defineClassButton = (type, state) => {
    const stateClass = ButtonState.LOADING === state ? 'button-loading' : '';
    return `${type} ${stateClass}`;
  };

  defineDisabledParam = state => {
    switch (state) {
      case ButtonState.DISABLED:
      case ButtonState.LOADING: {
        return true;
      }
      case ButtonState.ENABLED:
      case ButtonState.SELECT:
      default:
        return false;
    }
  };

  renderContentButton = (state, text) => {
    switch (state) {
      case ButtonState.LOADING: {
        return this.renderLoading();
      }
      case ButtonState.DISABLED:
      case ButtonState.ENABLED:
      case ButtonState.SELECT:
      default:
        return <span>{text}</span>;
    }
  };

  renderLoading = () => (
    <div className="loading">
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

export const ButtonType = {
  POPUP_CONFIRM: 'button-a popup-confirm-button',
  POPUP_CANCEL: 'button-a popup-cancel-button',
  BASIC: 'button-c'
};

export const ButtonState = {
  DISABLED: 0,
  ENABLED: 1,
  LOADING: 2,
  SELECT: 3
};

// eslint-disable-next-line fp/no-mutation
Button.propTypes = {
  id: PropTypes.number,
  onClick: PropTypes.func,
  state: PropTypes.number,
  text: PropTypes.string,
  type: PropTypes.string
};

export default Button;
