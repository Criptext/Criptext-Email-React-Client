import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-switch';
import { inputTypes } from './NonCriptextPopupWrapper';
import './noncriptext.css';

const NonCriptextPopup = props => {
  return (
    <div className="non-criptext-container">
      <div className="non-criptext-content">
        <section>{renderPopUp(props)}</section>
      </div>
    </div>
  );
};

const renderPopUp = props => {
  return (
    <div className="content">
      <div className="non-criptext-title">Non-Criptext Recipient</div>
      <div className="non-criptext-label">
        <span className="text">Send Encrypted</span>
        <span className="switch">{renderSwitch(props)}</span>
      </div>
      {props.mode === PopUpModes.SET_PASSWORD && (
        <div className="non-criptext-description">
          <span>
            Set a passphrase and share it with non-Criptext recipients so they
            can read your email.
          </span>
        </div>
      )}
      {props.mode === PopUpModes.SET_PASSWORD
        ? renderForm(props)
        : renderNote()}
      {renderButtons(props)}
    </div>
  );
};

const renderSwitch = props => {
  return (
    <Switch
      id="setPasswordSwitch"
      onChange={props.onChangeSwitch}
      checked={props.mode === PopUpModes.SET_PASSWORD}
      width={28}
      height={17}
      handleDiameter={13}
      offColor="#b4b4b4"
      onColor="#0091ff"
      uncheckedIcon={false}
      checkedIcon={false}
    />
  );
};

const renderForm = props => {
  const { password } = props.formItems;
  return (
    <div className="non-criptext-form">
      {renderInput({
        placeholder: 'Enter passphrase',
        value: password.value,
        type: password.type,
        onChange: ev => props.onChangeInputValue(ev, 'password')
      })}
      {renderInputIcon({
        type: password.type,
        onClick: () => props.onClickChangeInputType('password')
      })}
      {renderErrorMessage({
        value: password.value,
        error: password.error,
        message: `Must have ${props.minLength} characters`
      })}
    </div>
  );
};

const renderInput = ({ placeholder, value, type, onChange }) => (
  <input
    className="password"
    placeholder={placeholder}
    onChange={onChange}
    value={value}
    type={type}
  />
);

const renderInputIcon = ({ type, onClick }) => (
  <i
    className={type === inputTypes.PASSWORD ? 'icon-show' : 'icon-not-show'}
    onClick={onClick}
  />
);

const renderErrorMessage = ({ value, error, message }) => {
  const isDirty = value.length > 0;
  const hasError = error;
  return (
    <span
      className={`error-password-message ${
        isDirty && hasError ? '' : 'hidden'
      }`}
    >
      {message}
    </span>
  );
};

const renderNote = () => (
  <div className="non-criptext-note">
    <span>
      <b>Note:</b> non-Criptext email addresses will receive a normal,
      un-encrypted email.
    </span>
  </div>
);

const renderButtons = props => (
  <div className="non-criptext-buttons">
    <button
      className="button-send"
      onClick={() => props.onSubmitForm()}
      disabled={props.disabled}
    >
      Send
    </button>
    <button
      className="button-cancel"
      onClick={() => props.onClickCancelSendMessage()}
    >
      Cancel
    </button>
  </div>
);

const PopUpModes = {
  SET_PASSWORD: 'set-password',
  NO_PASSWORD: 'no-set-password'
};

renderPopUp.propTypes = {
  mode: PropTypes.string
};

renderSwitch.propTypes = {
  onChangeSwitch: PropTypes.func,
  mode: PropTypes.string
};

renderForm.propTypes = {
  minLength: PropTypes.number,
  formItems: PropTypes.object,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func
};

renderInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func
};

renderInputIcon.propTypes = {
  type: PropTypes.string,
  onClick: PropTypes.func
};

renderErrorMessage.propTypes = {
  value: PropTypes.string,
  error: PropTypes.bool,
  message: PropTypes.string
};

renderButtons.propTypes = {
  onSubmitForm: PropTypes.func,
  disabled: PropTypes.bool,
  onClickCancelSendMessage: PropTypes.func
};

export { NonCriptextPopup as default, PopUpModes };
