import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const { popUp } = string;
const { forgotPassword } = popUp;

const ForgotPasswordPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{forgotPassword[props.status].title}</h1>
      </div>
      <PopupContent {...props} />
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onDismiss}
        >
          <span>{forgotPassword[props.status].buttons.confirm}</span>
        </button>
      </div>
    </div>
  );
};

const PopupContent = props => {
  switch (props.status) {
    case 200: {
      return (
        <div className="popup-paragraph">
          <p>{forgotPassword[props.status].paragraph}</p>
          <p>
            <b>{props.blurEmailRecovery}</b>
          </p>
          <p>{forgotPassword[props.status].note}</p>
        </div>
      );
    }
    case 400: {
      return (
        <div className="popup-paragraph">
          <p>{forgotPassword[props.status].paragraph}</p>
          <p>
            <b>{'support@criptext.com'}</b>
          </p>
        </div>
      );
    }
    default:
      return (
        <div className="popup-paragraph">
          <p>{forgotPassword[props.status].paragraph}</p>
        </div>
      );
  }
};

// eslint-disable-next-line fp/no-mutation
ForgotPasswordPopup.propTypes = {
  onDismiss: PropTypes.func,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  message: PropTypes.string,
  email: PropTypes.string,
  title: PropTypes.string,
  dismissButtonLabel: PropTypes.string
};

export default ForgotPasswordPopup;
