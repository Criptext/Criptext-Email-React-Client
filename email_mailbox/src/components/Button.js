import React from 'react';
import PropTypes from 'prop-types';

const Button = props => (
  <button
    id={props.id}
    className={defineClassButton(props.type)}
    disabled={props.status === ButtonStatus.DISABLED}
    onClick={props.onClick}
  >
    <i className={props.icon} />
    <span>{props.text}</span>
  </button>
);

const defineClassButton = type => {
  switch (type) {
    case ButtonTypes.PRIMARY:
      return 'button-a button-aa';
    default:
      return 'button-a';
  }
};

Button.propTypes = {
  icon: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  status: PropTypes.number,
  text: PropTypes.string,
  type: PropTypes.number
};

export const ButtonTypes = {
  PRIMARY: 0,
  SECONDARY: 1
};

export const ButtonStatus = {
  NORMAL: 0,
  DISABLED: 1,
  LOADING: 2
};

export default Button;
