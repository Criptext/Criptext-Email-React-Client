import React from 'react';
import PropTypes from 'prop-types';
import './buttonicon.scss';

const ButtonIcon = props => (
  <button
    id={props.id}
    className={defineClassButton(props.type)}
    disabled={props.status === ButtonStatus.DISABLED}
    onClick={ev => props.onClick(ev)}
  >
    <i className={props.icon} />
  </button>
);

const defineClassButton = type => {
  switch (type) {
    case ButtonTypes.PRIMARY:
      return 'button-icon';
    default:
      return 'button-icon';
  }
};

ButtonIcon.propTypes = {
  icon: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  status: PropTypes.number,
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

export default ButtonIcon;
