import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './deleteaccountpopup.scss';

const {
  title,
  paragraphs,
  subtitle,
  inputs,
  cancelButtonLabel,
  confirmButtonLabel
} = string.popups.delete_account;

const DeleteAccountPopup = props => {
  return (
    <div id="popup-deleteaccount" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraphs.header}</p>
      </div>
      <div className="popup-subtitle">
        <h2>{subtitle}</h2>
      </div>
      <div className="popup-inputs">
        <DeleteAccountPopupInput {...props} />
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>{cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmDeleteAccount}
          disabled={props.isDisabledConfirmButton}
        >
          <span>{confirmButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

const DeleteAccountPopupInput = ({
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
      placeholder={inputs.password.placeholder}
      disabled={isDisabledInput}
    />
    <i className={icon} onClick={() => onClickChangeInputType()} />
    <DeleteAccountPopupInputErrorMessage
      hasError={hasError}
      errorMessage={errorMessage}
      value={value}
      isDisabledInput={isDisabledInput}
    />
  </div>
);

const DeleteAccountPopupInputErrorMessage = ({
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

DeleteAccountPopupInput.propTypes = {
  icon: PropTypes.string,
  isDisabledInput: PropTypes.bool,
  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.string
};

DeleteAccountPopup.propTypes = {
  isDisabledConfirmButton: PropTypes.bool,
  onTogglePopup: PropTypes.func,
  onClickConfirmDeleteAccount: PropTypes.func
};

export default DeleteAccountPopup;
