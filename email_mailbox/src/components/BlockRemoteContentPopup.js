import React from 'react';
import PropTypes from 'prop-types';

const DialogPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>{props.message}</p>
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

DialogPopup.propTypes = {
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
  message: PropTypes.string,
  title: PropTypes.string,
  leftButtonLabel: PropTypes.string,
  rightButtonLabel: PropTypes.string
};

export default DialogPopup;
