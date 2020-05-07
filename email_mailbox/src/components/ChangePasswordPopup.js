import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const ChangePasswordPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.change_password.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.change_password.paragraphs.header}</p>
      </div>
      <ChangePasswordPopupInputs {...props} />
      <ChangePasswordPopupButtons {...props} />
    </div>
  );
};

const ChangePasswordPopupInputs = props => {
  return (
    <div className="popup-inputs">
      <ChangePasswordPopupInput
        name={props.oldPasswordInput.name}
        type={props.oldPasswordInput.type}
        value={props.oldPasswordInput.value}
        icon={props.oldPasswordInput.icon}
        placeholder={
          string.popups.change_password.input.old_password.placeholder
        }
        onChangeValue={props.onChangeInputValueChangePassword}
        onChangeType={props.onClickChangePasswordInputType}
        hasError={props.oldPasswordInput.hasError}
        errorMessage={props.oldPasswordInput.errorMessage}
      />
      <div className="forgot-password-link">
        <button
          className="button button-b"
          onClick={props.onClickForgotPasswordLink}
        >
          {string.popups.change_password.input.old_password.button}
        </button>
      </div>
      <ChangePasswordPopupInput
        name={props.newPasswordInput.name}
        type={props.newPasswordInput.type}
        value={props.newPasswordInput.value}
        icon={props.newPasswordInput.icon}
        placeholder={
          string.popups.change_password.input.new_password.placeholder
        }
        onChangeValue={props.onChangeInputValueChangePassword}
        onChangeType={props.onClickChangePasswordInputType}
        hasError={props.newPasswordInput.hasError}
        errorMessage={props.newPasswordInput.errorMessage}
      />
      <ChangePasswordPopupInput
        name={props.confirmNewPasswordInput.name}
        type={props.confirmNewPasswordInput.type}
        value={props.confirmNewPasswordInput.value}
        icon={props.confirmNewPasswordInput.icon}
        placeholder={
          string.popups.change_password.input.repeat_password.placeholder
        }
        onChangeValue={props.onChangeInputValueChangePassword}
        onChangeType={props.onClickChangePasswordInputType}
        hasError={props.confirmNewPasswordInput.hasError}
        errorMessage={props.confirmNewPasswordInput.errorMessage}
      />
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

const ChangePasswordPopupButtons = props => (
  <div className="popup-buttons">
    {props.isLoading ? (
      <LoadingWheel />
    ) : (
      <div>
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>{string.popups.change_password.cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onConfirmChangePassword}
          disabled={props.isDisabledChangePasswordSubmitButton}
        >
          <span>{string.popups.change_password.confirmButtonLabel}</span>
        </button>
      </div>
    )}
  </div>
);

const LoadingWheel = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

ChangePasswordPopupInputs.propTypes = {
  oldPasswordInput: PropTypes.object,
  newPasswordInput: PropTypes.object,
  confirmNewPasswordInput: PropTypes.object,
  onChangeInputValueChangePassword: PropTypes.func,
  onClickChangePasswordInputType: PropTypes.func,
  onClickForgotPasswordLink: PropTypes.func
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

ChangePasswordPopupButtons.propTypes = {
  isDisabledChangePasswordSubmitButton: PropTypes.bool,
  isLoading: PropTypes.bool,
  onConfirmChangePassword: PropTypes.func,
  onTogglePopup: PropTypes.func
};

export default ChangePasswordPopup;
