import React from 'react';
import PropTypes from 'prop-types';
import './removedevicepopup.css';

const RemoveDevicePopup = props => {
  return (
    <div id="popup-removedevice" className="popup-content">
      <div className="popup-title">
        <h1>Remove Device</h1>
      </div>
      <div className="popup-paragraph">
        <p>
          Removing access will automatically sign you out of your account on
          this device.
        </p>
      </div>
      <div className="popup-subtitle">
        <h2>To confirm enter your password</h2>
      </div>
      <div className="popup-inputs">
        <PasswordChangedPopupInput {...props} />
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelRemoveDevice}
        >
          <span>Cancel</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmRemoveDevice}
          disabled={props.isDisabledConfirmButton}
        >
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
};

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
  <div className="popup-input">
    <input
      type={type}
      value={value}
      onChange={ev => onChangeInputValue(ev)}
      placeholder={'Enter password'}
      disabled={isDisabledInput}
    />
    {type === 'password' && (
      <i className={icon} onClick={() => onClickChangeInputType()} />
    )}
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

PasswordChangedPopupInput.propTypes = {
  icon: PropTypes.string,
  isDisabledInput: PropTypes.bool,
  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.string
};

RemoveDevicePopup.propTypes = {
  isDisabledConfirmButton: PropTypes.bool,
  onClickCancelRemoveDevice: PropTypes.func,
  onClickConfirmRemoveDevice: PropTypes.func
};

export default RemoveDevicePopup;
