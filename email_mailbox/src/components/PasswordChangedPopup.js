import React from 'react';
import PropTypes from 'prop-types';
import './passwordchangedpopup.css';

const PasswordChangedPopup = props => {
  return (
    <div className="password-changed-popup-container">
      <div className="password-changed-popup-title">
        Enter your password to continue
      </div>
      {renderText()}
      {renderInput(props)}
      {renderButtons(props)}
    </div>
  );
};

const renderText = () => (
  <div className="password-changed-popup-text">
    <div className="text">
      Your password has changed remotely and you must confirm your new password.
    </div>
    <div className="text">
      <strong>If you Cancel</strong> the device will log out and{' '}
      <strong>all local data will be erased</strong>
    </div>
  </div>
);

const renderInput = ({
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
    {renderErrorMessage(hasError, errorMessage, value, isDisabledInput)}
  </div>
);

const renderErrorMessage = (hasError, errorMessage, value, isDisabledInput) => {
  const shouldRenderMessage =
    (hasError && errorMessage.length > 0 && value.length > 0) ||
    isDisabledInput;
  return shouldRenderMessage && <span>{errorMessage}</span>;
};

const renderButtons = props => (
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

renderInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.string,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  isDisabledInput: PropTypes.bool
};

renderButtons.propTypes = {
  onClickCancelPasswordChanged: PropTypes.func,
  onConfirmPasswordChanged: PropTypes.func,
  isDisabledConfirmButton: PropTypes.bool
};

export default PasswordChangedPopup;
