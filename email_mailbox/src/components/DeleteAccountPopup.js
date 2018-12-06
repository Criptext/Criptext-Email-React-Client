import React from 'react';
import PropTypes from 'prop-types';

const DeleteAccountPopup = props => {
  return (
    <div id="popup-deleteaccount" className="popup-content">
      <div className="popup-title">
        <h1>Delete My Account</h1>
      </div>
      <div className="popup-paragraph">
        <p>
          Deleting your account will also delete all your emails in this and any
          other device in which your account is logged into. It will also enable
          anyone to register an account with your current email address.
        </p>
      </div>
      <div className="popup-subtitle">
        <h2>To confirm enter your password</h2>
      </div>
      <div className="popup-inputs">
        <DeleteAccountPopupInput {...props} />
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelDeleteAccount}
        >
          <span>Cancel</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmDeleteAccount}
          disabled={props.isDisabledConfirmButton}
        >
          <span>Send</span>
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
      placeholder={'Enter password'}
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
  onClickCancelDeleteAccount: PropTypes.func,
  onClickConfirmDeleteAccount: PropTypes.func
};

export default DeleteAccountPopup;
