import React from 'react';
import PropTypes from 'prop-types';
import './changerecoveryemailpopup.css';

const recoveryEmailText = 'Enter your new Recovery email';
const passwordText = 'To confirm enter your password';

const ChangeRecoveryEmailPopup = props => {
  return (
    <div className="change-recovery-email-popup-content">
      <div className="change-recovery-email-popup-title">
        <h1>Change Recovery Email</h1>
      </div>
      <ChangeRecoveryEmailPopupText text={recoveryEmailText} />
      <ChangeRecoveryEmailPopupInputs {...props} />
      <ChangeRecoveryEmailPopupButtons {...props} />
    </div>
  );
};

const ChangeRecoveryEmailPopupText = ({ text }) => (
  <div className="change-recovery-email-popup-text">
    <span>{text}</span>
  </div>
);

const ChangeRecoveryEmailPopupInputs = props => {
  return (
    <div className="change-recovery-email-popup-inputs">
      <ChangePasswordPopupInput
        name={props.recoveryEmailPopupInputEmail.name}
        type={props.recoveryEmailPopupInputEmail.type}
        value={props.recoveryEmailPopupInputEmail.value}
        icon={props.recoveryEmailPopupInputEmail.icon}
        placeholder={'Enter new recovery email'}
        onChangeValue={props.onChangeInputValueOnChangeRecoveryEmailPopup}
        onChangeType={() => {}}
        hasError={props.recoveryEmailPopupInputEmail.hasError}
        errorMessage={props.recoveryEmailPopupInputEmail.errorMessage}
      />
      <ChangeRecoveryEmailPopupText text={passwordText} />
      <ChangePasswordPopupInput
        name={props.recoveryEmailPopupInputPassword.name}
        type={props.recoveryEmailPopupInputPassword.type}
        value={props.recoveryEmailPopupInputPassword.value}
        icon={props.recoveryEmailPopupInputPassword.icon}
        placeholder={'Enter password'}
        onChangeValue={props.onChangeInputValueOnChangeRecoveryEmailPopup}
        onChangeType={props.onClickChangeRecoveryEmailInputType}
        hasError={props.recoveryEmailPopupInputPassword.hasError}
        errorMessage={props.recoveryEmailPopupInputPassword.errorMessage}
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
  <div className="change-recovery-email-input">
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
  <div className="change-recovery-email-popup-buttons">
    <button
      className="button button-a change-recovery-email-cancel-button"
      onClick={props.onClickCancelChangePassword}
    >
      Cancel
    </button>
    <button
      className="button button-a change-recovery-email-confirm-button"
      onClick={props.onConfirmChangeRecoveryEmail}
      disabled={props.isDisabledChangeRecoveryEmailSubmitButton}
    >
      Confim
    </button>
  </div>
);

ChangeRecoveryEmailPopupText.propTypes = {
  text: PropTypes.string
};

ChangeRecoveryEmailPopupInputs.propTypes = {
  onChangeInputValueOnChangeRecoveryEmailPopup: PropTypes.func,
  onClickChangeRecoveryEmailInputType: PropTypes.func,
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
