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
  switch (props.type) {
    case PopupTypes.FORGOT_LINK: {
      return (
        <div className="popup-paragraph">
          <p>{props.prefix}</p>
          <p>
            <b>{props.email}</b>
          </p>
          <p>{props.suffix}</p>
        </div>
      );
    }
    case PopupTypes.EMAIL_NOT_SET: {
      return (
        <div className="popup-paragraph">
          <p>{props.message}</p>
          <p>
            <b>{props.email}</b>
          </p>
        </div>
      );
    }
    default:
      return (
        <div className="popup-paragraph">
          <p>
            <b>{props.message}</b>
          </p>
        </div>
      );
  }
};

// eslint-disable-next-line fp/no-mutation
LoginPopup.propTypes = {
  onDismiss: PropTypes.func,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  message: PropTypes.string,
  email: PropTypes.string,
  title: PropTypes.string,
  dismissButtonLabel: PropTypes.string
};

export const PopupTypes = {
  DEFAULT: 'DEFAULT',
  FORGOT_LINK: 'FORGOT_LINK',
  EMAIL_NOT_SET: 'EMAIL_NOT_SET'
};

export default LoginPopup;
