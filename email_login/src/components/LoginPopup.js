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
        className="button-a popup-confirm-button"
        onClick={props.onDismiss}
      >
        <span>{props.dismissButtonLabel}</span>
      </button>
    </div>
  </div>
);

const PopupContent = props => {
  switch(props.type) {
    case 'ForgotLink': {
      return <div className="popup-paragraph">
        <p>{props.prefix}</p>
        <p><b>{props.email}</b></p>
        <p>{props.suffix}</p>
      </div>
    }
    case 'EmailNotSet': {
      return <div className="popup-paragraph">
        <p>{props.message}</p>
        <p><b>{props.email}</b></p>
      </div>
    }
    default: 
      return <div className="popup-paragraph">
        <p><b>{props.message}</b></p>
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