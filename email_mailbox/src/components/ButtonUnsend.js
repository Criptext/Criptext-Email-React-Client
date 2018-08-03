import React from 'react';
import PropTypes from 'prop-types';
import './buttonunsend.css';

const ButtonUnsend = props => (
  <button
    className={
      'button-unsend ' +
      (props.displayLoading ? 'button-unsend-loading' : 'button-unsend-normal')
    }
    onClick={ev => props.onClick(ev)}
  >
    {props.displayLoading ? renderLoading() : renderButton()}
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

ButtonUnsend.propTypes = {
  displayLoading: PropTypes.bool,
  onClick: PropTypes.func
};

export default ButtonUnsend;
