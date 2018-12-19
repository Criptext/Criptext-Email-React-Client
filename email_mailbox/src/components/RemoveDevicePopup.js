import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './removedevicepopup.scss';

const RemoveDevicePopup = props => {
  return (
    <div id="popup-removedevice" className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.remove_device.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.remove_device.paragraphs.header}</p>
      </div>
      <div className="popup-subtitle">
        <h2>{string.popups.remove_device.paragraphs.password}</h2>
      </div>
      <div className="popup-inputs">
        <PasswordChangedPopupInput {...props} />
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelRemoveDevice}
        >
          <span>{string.popups.remove_device.cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmRemoveDevice}
          disabled={props.isDisabledConfirmButton}
        >
          <span>{string.popups.remove_device.confirmButtonLabel}</span>
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
      placeholder={string.popups.remove_device.input.password.placeholder}
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
