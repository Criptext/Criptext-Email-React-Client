import React from 'react';
import PropTypes from 'prop-types';
import './button.scss';

const Button = props => (
  <button
    className={defineClassButton(props.type, props.state)}
    disabled={defineDisabledParam(props.state)}
    onClick={e => props.onClick(e, props.id)}
  >
    {renderContentButton(props.state, props.text)}
    &nbsp;
  </button>
);

const defineClassButton = (type, state) => {
  const stateClass = ButtonState.LOADING === state ? 'button-loading' : '';
  return `${type} ${stateClass}`;
};

const defineDisabledParam = state => {
  switch (state) {
    case ButtonState.DISABLED:
    case ButtonState.LOADING: {
      return true;
    }
    case ButtonState.ENABLED:
    default:
      return false;
  }
};

const renderContentButton = (state, text) => {
  switch (state) {
    case ButtonState.LOADING: {
      return renderLoading();
    }
    case ButtonState.DISABLED:
    case ButtonState.ENABLED:
    default:
      return <span>{text}</span>;
  }
};

const renderLoading = () => (
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

export const ButtonType = {
  POPUP_CONFIRM: 'button-a popup-confirm-button',
  POPUP_CANCEL: 'button-a popup-cancel-button',
  BASIC: 'button-c'
};

export const ButtonState = {
  DISABLED: 0,
  ENABLED: 1,
  LOADING: 2
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
