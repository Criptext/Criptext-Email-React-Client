import React from 'react';
import PropTypes from 'prop-types';
import './passwordchangedpopup.css';

const PasswordChangedPopup = props => {
  return (
    <div className="password-changed-popup-container">
      <PasswordChangedPopupTitle />
      <PasswordChangedPopupText />
      <PasswordChangedPopupInput {...props} />
      <PasswordChangedPopupButtons {...props} />
    </div>
  );
};

const PasswordChangedPopupTitle = () => (
  <div className="password-changed-popup-title">
    <span>Enter your password to continue</span>
  </div>
);

const PasswordChangedPopupText = () => (
  <div className="password-changed-popup-text">
    <div className="text">
      <span>
        Your password has changed remotely and you must confirm your new
        password.
      </span>
    </div>
    <div className="text">
      <span>
        <strong>If you Cancel</strong> the device will log out and
        <strong> all local data will be erased</strong>
      </span>
    </div>
  </div>
);

const PasswordChangedPopupInput = ({
  type,
  value,
  icon,
  onChangeInputValue,
  onClickChangeInputType,
  hasError,
  errorMessage,
  isDisabledInput
}) => (
  <div className="password-changed-input">
    <input
      type={type}
      value={value}
      onChange={ev => onChangeInputValue(ev)}
      placeholder={'Enter password'}
      disabled={isDisabledInput}
    />
    <i className={icon} onClick={() => onClickChangeInputType()} />
    <PasswordChangedPopupInputErrorMessage
      hasError={hasError}
      errorMessage={errorMessage}
      value={value}
      isDisabledInput={isDisabledInput}
    />
  </div>
);

const PasswordChangedPopupInputErrorMessage = ({
  hasError,
  errorMessage,
  value,
  isDisabledInput
}) => {
  const shouldRenderMessage =
    (hasError && errorMessage.length > 0 && value.length > 0) ||
    isDisabledInput;
  return shouldRenderMessage && <span>{errorMessage}</span>;
};

const PasswordChangedPopupButtons = props => (
  <div className="password-changed-popup-buttons">
    <button
      className="button button-a password-changed-cancel-button"
      onClick={props.onClickCancelPasswordChanged}
    >
      Cancel
    </button>
    <button
      className="button button-a password-changed-confirm-button"
      onClick={props.onConfirmPasswordChanged}
      disabled={props.isDisabledConfirmButton}
    >
      Confirm
    </button>
  </div>
);

PasswordChangedPopupInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.string,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  isDisabledInput: PropTypes.bool
};

PasswordChangedPopupButtons.propTypes = {
  onClickCancelPasswordChanged: PropTypes.func,
  onConfirmPasswordChanged: PropTypes.func,
  isDisabledConfirmButton: PropTypes.bool
};

export default PasswordChangedPopup;
