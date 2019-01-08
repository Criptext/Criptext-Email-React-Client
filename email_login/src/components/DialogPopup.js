import React from 'react';
import PropTypes from 'prop-types';

const LoginPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>
    <PopupContent {...props} />
    <div className="popup-buttons">
      <button
        className="button-a popup-cancel-button"
        onClick={props.onRightButtonClick}
      >
        <span>{props.leftButtonLabel}</span>
      </button>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onLeftButtonClick}
      >
        <span>{props.rightButtonLabel}</span>
      </button>
    </div>
  </div>
);

const PopupContent = props => {
  switch(props.type) {
    default: 
      return <div className="popup-paragraph">
        <p>{props.message}</p>
      </div>
  }
}

LoginPopup.propTypes = {
  onDismiss: PropTypes.func,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  message: PropTypes.string,
  dismissButtonLabel: PropTypes.string
};

export default LoginPopup;