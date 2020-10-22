import React from 'react';
import PropTypes from 'prop-types';
import './button.scss';

export const STYLE = {
  CRIPTEXT: 'criptext-button',
  CLEAR: 'clear-button',
  TEXT: 'text-button'
};

const Button = props => (
  <button
    onClick={props.onClick}
    className={`custom-button ${props.style}`}
    disabled={typeof props.disabled === 'boolean' ? props.disabled : false}
  >
    {props.text}
  </button>
);

Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  style: PropTypes.string,
  text: PropTypes.string
};

export default Button;
