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
      {props.isLoading ? (
        <LoadingWheel />
      ) : (
        <div>
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
      )}
    </div>
  </div>
);

const LoadingWheel = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

DialogPopup.propTypes = {
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
  message: PropTypes.string,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  leftButtonLabel: PropTypes.string,
  rightButtonLabel: PropTypes.string
};

export default DialogPopup;
