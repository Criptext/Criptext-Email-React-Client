import React from 'react';
import PropTypes from 'prop-types';

const SignUpPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>
        {props.prefix}
        <strong>{props.strong}</strong>
        {props.suffix}
      </p>
    </div>
    <div className="popup-buttons">
      <button
        className="button-a popup-cancel-button"
        onClick={props.onLeftButtonClick}
      >
        <span>{props.leftButtonLabel}</span>
      </button>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onRightButtonClick}
      >
        <span>{props.rightButtonLabel}</span>
      </button>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
SignUpPopup.propTypes = {
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  strong: PropTypes.string,
  title: PropTypes.string,
  leftButtonLabel: PropTypes.string,
  rightButtonLabel: PropTypes.string
};

export default SignUpPopup;
