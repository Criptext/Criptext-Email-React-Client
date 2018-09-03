import React from 'react';
import PropTypes from 'prop-types';
import './changepasswordpopup.css';

const ChangePasswordPopup = props => {
  return (
    <div className="change-password-popup-content">
      <div className="change-password-popup-title">
        <h1>Change Password</h1>
      </div>
      <div className="change-password-popup-text">
        <span>Enter your password then your new password and confirm it</span>
      </div>
      <ChangePasswordPopupInputs {...props} />
      <ChangePasswordPopupButtons {...props} />
    </div>
  );
};

const ChangePasswordPopupInputs = props => {
  return (
    <div className="change-password-popup-inputs">
      <ChangePasswordPopupInput
        name={props.oldPasswordInput.name}
        type={props.oldPasswordInput.type}
        value={props.oldPasswordInput.value}
        icon={props.oldPasswordInput.icon}
        placeholder={'Enter old password'}
        onChangeValue={props.onChangeInputValueChangePassword}
        onChangeType={props.onClickChangePasswordInputType}
        hasError={props.oldPasswordInput.hasError}
        errorMessage={props.oldPasswordInput.errorMessage}
      />
      <ChangePasswordPopupInput
        name={props.newPasswordInput.name}
        type={props.newPasswordInput.type}
        value={props.newPasswordInput.value}
        icon={props.newPasswordInput.icon}
        placeholder={'Enter new password'}
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
        placeholder={'Repeat new password'}
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
  <div className="change-password-input">
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
  <div className="change-password-popup-buttons">
    <button
      className="button button-a change-password-cancel-button"
      onClick={props.onClickCancelChangePassword}
    >
      Cancel
    </button>
    <button
      className="button button-a change-password-confirm-button"
      onClick={props.onConfirmChangePassword}
      disabled={props.isDisabledChangePasswordSubmitButton}
    >
      Confim
    </button>
  </div>
);

ChangePasswordPopupInputs.propTypes = {
  oldPasswordInput: PropTypes.object,
  newPasswordInput: PropTypes.object,
  confirmNewPasswordInput: PropTypes.object,
  onChangeInputValueChangePassword: PropTypes.func,
  onClickChangePasswordInputType: PropTypes.func
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
  onConfirmChangePassword: PropTypes.func,
  onClickCancelChangePassword: PropTypes.func
};

export default ChangePasswordPopup;
