import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './changerecoveryemailpopup.scss';

const recoveryEmailText =
  string.popups.change_recovery_email.paragraph.recovery_email;
const passwordText = string.popups.change_recovery_email.paragraph.password;
const noteText = string.popups.change_recovery_email.paragraph.note_text;

const ChangeRecoveryEmailPopup = props => {
  return (
    <div className="popup-content change-recovery-email-popup-content">
      <div className="popup-title">
        <h1>{string.popups.change_recovery_email.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{recoveryEmailText}</p>
      </div>
      <div className="popup-inputs">
        <ChangePasswordPopupInput
          name={props.recoveryEmailPopupInputEmail.name}
          type={props.recoveryEmailPopupInputEmail.type}
          value={props.recoveryEmailPopupInputEmail.value}
          icon={props.recoveryEmailPopupInputEmail.icon}
          placeholder={
            string.popups.change_recovery_email.input.recovery_email.placeholder
          }
          onChangeValue={props.onChangeInputValueOnChangeRecoveryEmailPopup}
          onChangeType={() => {}}
          hasError={props.recoveryEmailPopupInputEmail.hasError}
          errorMessage={props.recoveryEmailPopupInputEmail.errorMessage}
        />
        <div className="popup-paragraph">
          <p>{passwordText}</p>
        </div>
        <ChangePasswordPopupInput
          name={props.recoveryEmailPopupInputPassword.name}
          type={props.recoveryEmailPopupInputPassword.type}
          value={props.recoveryEmailPopupInputPassword.value}
          icon={props.recoveryEmailPopupInputPassword.icon}
          placeholder={
            string.popups.change_recovery_email.input.password.placeholder
          }
          onChangeValue={props.onChangeInputValueOnChangeRecoveryEmailPopup}
          onChangeType={props.onClickChangeRecoveryEmailInputType}
          hasError={props.recoveryEmailPopupInputPassword.hasError}
          errorMessage={props.recoveryEmailPopupInputPassword.errorMessage}
        />
        <div className="forgot-password-link">
          <button
            className="button button-b"
            onClick={props.onClickForgotPasswordLink}
          >
            {string.popups.change_recovery_email.input.password.button}
          </button>
        </div>
      </div>
      <div className="popup-paragraph change-recovery-email-note">
        <p>
          <strong>{`${
            string.popups.change_recovery_email.paragraph.note
          }:`}</strong>{' '}
          {noteText}
        </p>
      </div>
      <ChangeRecoveryEmailPopupButtons {...props} />
    </div>
  );
};

const ChangePasswordPopupInput = ({
  name,
  type,
  value,
  icon,
  placeholder,
  onChangeValue,
  onChangeType,
  hasError,
  errorMessage
}) => (
  <div className="popup-input">
    <input
      name={name}
      type={type}
      value={value}
      onChange={ev => onChangeValue(ev)}
      placeholder={placeholder}
    />
    <i className={icon} onClick={() => onChangeType(name)} />
    <InputErrorMessage
      hasError={hasError}
      errorMessage={errorMessage}
      value={value}
    />
  </div>
);

const InputErrorMessage = ({ hasError, errorMessage, value }) => {
  const shouldRenderMessage =
    hasError && errorMessage.length > 0 && value.length > 0;
  return shouldRenderMessage && <span>{errorMessage}</span>;
};

const ChangeRecoveryEmailPopupButtons = props => (
  <div className="popup-buttons">
    <button
      className="button-a popup-cancel-button"
      onClick={props.onClickCancelChangePassword}
    >
      <span>{string.popups.change_recovery_email.cancelButtonLabel}</span>
    </button>
    <button
      className="button-a popup-confirm-button"
      onClick={props.onConfirmChangeRecoveryEmail}
      disabled={props.isDisabledChangeRecoveryEmailSubmitButton}
    >
      <span>{string.popups.change_recovery_email.confirmButtonLabel}</span>
    </button>
  </div>
);

ChangeRecoveryEmailPopup.propTypes = {
  onChangeInputValueOnChangeRecoveryEmailPopup: PropTypes.func,
  onClickChangeRecoveryEmailInputType: PropTypes.func,
  onClickForgotPasswordLink: PropTypes.func,
  recoveryEmailPopupInputEmail: PropTypes.object,
  recoveryEmailPopupInputPassword: PropTypes.object
};

ChangePasswordPopupInput.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  onChangeValue: PropTypes.func,
  onChangeType: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string
};

InputErrorMessage.propTypes = {
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  value: PropTypes.string
};

ChangeRecoveryEmailPopupButtons.propTypes = {
  isDisabledChangeRecoveryEmailSubmitButton: PropTypes.bool,
  onClickCancelChangePassword: PropTypes.func,
  onConfirmChangeRecoveryEmail: PropTypes.func
};

export default ChangeRecoveryEmailPopup;
