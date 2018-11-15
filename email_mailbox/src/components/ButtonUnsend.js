import React from 'react';
import PropTypes from 'prop-types';
import './buttonunsend.scss';

const ButtonUnsend = props => (
  <button
    className={`button-unsend ${defineClassButton(props.status)}`}
    onClick={ev => props.onClick(ev)}
  >
    {props.status === ButtonUnsendStatus.LOAD
      ? renderLoading()
      : renderButton()}
  </button>
);

const renderButton = () => (
  <div>
    <i className="icon-unsend" />
    <span>unsend</span>
  </div>
);

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

const defineClassButton = status => {
  switch (status) {
    case ButtonUnsendStatus.NORMAL:
      return 'button-unsend-normal';
    case ButtonUnsendStatus.LOAD:
      return 'button-unsend-loading';
    default:
      return '';
  }
};

ButtonUnsend.propTypes = {
  onClick: PropTypes.func,
  status: PropTypes.number
};

export const ButtonUnsendStatus = {
  NORMAL: 0,
  LOAD: 1
};

export default ButtonUnsend;
