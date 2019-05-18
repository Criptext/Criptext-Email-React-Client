import React from 'react';
import PropTypes from 'prop-types';

const DialogPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>

    <DialogContent {...props} />

    <div className="popup-buttons">
      <DialogButton
        type="cancel"
        label={props.cancelButtonLabel}
        onClick={props.onCancelClick}
      />
      <DialogButton
        type="confirm"
        label={props.confirmButtonLabel}
        onClick={props.onConfirmClick}
      />
    </div>
  </div>
);

const DialogContent = props => {
  switch (props.type) {
    case DialogTypes.SIGN_ANOTHER_ACCOUNT: {
      return (
        <div className="popup-items">
          <div className="popup-paragraph">
            <p>{props.prefix}</p>
          </div>
          <div className="popup-list">
            <ul>
              {props.list.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          </div>
          <div className="popup-paragraph">
            <p>{props.suffix}</p>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="popup-items">
          <div className="popup-paragraph">
            <p>
              {props.prefix}
              <strong>{props.strong}</strong>
              {props.suffix}
            </p>
          </div>
        </div>
      );
  }
};

const DialogButton = ({ type, label, onClick }) => {
  switch (type) {
    case 'confirm': {
      return (
        <button className="button-a popup-confirm-button" onClick={onClick}>
          <span>{label}</span>
        </button>
      );
    }
    case 'cancel': {
      return (
        <button className="button-a popup-cancel-button" onClick={onClick}>
          <span>{label}</span>
        </button>
      );
    }
    default:
      return (
        <button className="button-a" onClick={onClick}>
          <span>{label}</span>
        </button>
      );
  }
};

// eslint-disable-next-line fp/no-mutation
DialogPopup.propTypes = {
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  strong: PropTypes.string,
  title: PropTypes.string
};

export const DialogTypes = {
  DEFAULT: 'DEFAULT',
  SIGN_ANOTHER_ACCOUNT: 'SIGN_ANOTHER_ACCOUNT'
};

export default DialogPopup;
