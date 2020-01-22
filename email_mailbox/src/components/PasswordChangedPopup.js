import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const PasswordChangedPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.password_changed.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.password_changed.parragraphs.password}</p>
        <p>
          <strong>{string.popups.password_changed.parragraphs.cancel}</strong>{' '}
          {string.popups.password_changed.parragraphs.device}
          <strong> {string.popups.password_changed.parragraphs.data}</strong>
        </p>
      </div>
      <div className="popup-inputs">
        <PasswordChangedPopupInput {...props} />
      </div>
      <PasswordChangedPopupButtons {...props} />
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
  <div className="popup-buttons">
    <button
      className="button-a popup-cancel-button"
      onClick={props.onClickCancelPasswordChanged}
    >
      <span>{string.popups.change_password.cancelButtonLabel}</span>
    </button>
    <button
      className="button-a popup-confirm-button"
      onClick={props.onConfirmPasswordChanged}
      disabled={props.isDisabledConfirmButton}
    >
      <span>{string.popups.change_password.confirmButtonLabel}</span>
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
