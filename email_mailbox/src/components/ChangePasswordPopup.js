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
        Enter your password then your new password and confirm it
      </div>
      {renderInputs(props)}
      {renderButtons(props)}
    </div>
  );
};

const renderInputs = props => {
  return (
    <div className="change-password-popup-inputs">
      {renderInput({
        name: props.oldPasswordInput.name,
        type: props.oldPasswordInput.type,
        value: props.oldPasswordInput.value,
        icon: props.oldPasswordInput.icon,
        placeholder: 'Enter old password',
        onChangeValue: props.onChangeInputValueChangePassword,
        onChangeType: props.onClickChangePasswordInputType,
        hasError: props.oldPasswordInput.hasError,
        errorMessage: props.oldPasswordInput.errorMessage
      })}
      {renderInput({
        name: props.newPasswordInput.name,
        type: props.newPasswordInput.type,
        value: props.newPasswordInput.value,
        icon: props.newPasswordInput.icon,
        placeholder: 'Enter new password',
        onChangeValue: props.onChangeInputValueChangePassword,
        onChangeType: props.onClickChangePasswordInputType,
        hasError: props.newPasswordInput.hasError,
        errorMessage: props.newPasswordInput.errorMessage
      })}
      {renderInput({
        name: props.confirmNewPasswordInput.name,
        type: props.confirmNewPasswordInput.type,
        value: props.confirmNewPasswordInput.value,
        icon: props.confirmNewPasswordInput.icon,
        placeholder: 'Repeat new password',
        onChangeValue: props.onChangeInputValueChangePassword,
        onChangeType: props.onClickChangePasswordInputType,
        hasError: props.confirmNewPasswordInput.hasError,
        errorMessage: props.confirmNewPasswordInput.errorMessage
      })}
    </div>
  );
};

const renderInput = ({
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
    {hasError && errorMessage.length && <span>{errorMessage}</span>}
  </div>
);

const renderButtons = props => (
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
      disabled={props.isDisabledChangePasswordButton}
    >
      Confim
    </button>
  </div>
);

renderInputs.propTypes = {
  oldPasswordInput: PropTypes.object,
  newPasswordInput: PropTypes.object,
  confirmNewPasswordInput: PropTypes.object,
  onChangeInputValueChangePassword: PropTypes.func,
  onClickChangePasswordInputType: PropTypes.func
};

renderInput.propTypes = {
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

renderButtons.propTypes = {
  isDisabledChangePasswordButton: PropTypes.bool,
  onConfirmChangePassword: PropTypes.func,
  onClickCancelChangePassword: PropTypes.func
};

export default ChangePasswordPopup;
