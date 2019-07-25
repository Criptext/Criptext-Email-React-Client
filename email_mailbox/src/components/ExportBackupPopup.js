import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import { inputTypes } from './ExportBackupPopupWrapper';
import string from './../lang';
import './exportbackuppopup.scss';

const {
  title,
  switchLabel,
  description,
  inputPassphrase,
  note,
  buttons
} = string.popups.export_backup;

const ExportBackupPopup = props => {
  return (
    <div id="export-backup-file-popup" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph encrypt-backup-switch-section">
        <p>{switchLabel}</p>
        <span className="switch">{renderSwitch(props)}</span>
      </div>
      {props.mode === PopUpModes.ENCRYPT && (
        <div className="popup-paragraph encrypt-description">
          <p>{description}</p>
        </div>
      )}
      {props.mode === PopUpModes.ENCRYPT ? renderForm(props) : renderNote()}
      {renderButtons(props)}
    </div>
  );
};

const renderSwitch = props => (
  <Switch
    theme="two"
    name="exportBackupSwitch"
    onChange={props.onChangeSwitch}
    checked={props.mode === PopUpModes.ENCRYPT}
  />
);

const renderForm = props => {
  const { password } = props.formItems;
  const { prefix, suffix } = inputPassphrase.errorMessages.len;
  return (
    <div className="popup-inputs">
      <div className="popup-input">
        <input
          placeholder={inputPassphrase.placeholder}
          onChange={ev => props.onChangeInputValue(ev)}
          value={password.value}
          type={password.type}
          autoFocus
        />
        <i
          className={defineIconClass(password.type)}
          onClick={() => props.onClickChangeInputType()}
        />
        <span
          className={defineErrorMessageClass(password.value, password.error)}
        >
          {`${prefix} ${props.minLength} ${suffix}`}
        </span>
      </div>
    </div>
  );
};

const defineIconClass = type =>
  type === inputTypes.PASSWORD ? 'icon-show' : 'icon-not-show';

const defineErrorMessageClass = (value, error) => {
  const isDirty = value.length > 0;
  const hasError = error;
  return `error-password-message ${isDirty && hasError ? '' : 'hidden'}`;
};

const renderNote = () => (
  <div className="popup-paragraph unencrypt-note">
    <p>
      <b>{note.header}</b> {note.content}
    </p>
  </div>
);

const renderButtons = props => (
  <div className="popup-buttons">
    <button
      className="button-a popup-cancel-button"
      onClick={() => props.onTogglePopup()}
    >
      {buttons.cancel}
    </button>
    <button
      className="button-a popup-confirm-button"
      onClick={() => props.onSubmitForm()}
      disabled={props.disabled}
    >
      {buttons.send}
    </button>
  </div>
);

const PopUpModes = {
  ENCRYPT: 'set-password',
  UNENCRYPT: 'no-set-password'
};

ExportBackupPopup.propTypes = {
  mode: PropTypes.string
};

renderSwitch.propTypes = {
  mode: PropTypes.string,
  onChangeSwitch: PropTypes.func
};

renderForm.propTypes = {
  formItems: PropTypes.object,
  minLength: PropTypes.number,
  onChangeInputValue: PropTypes.func,
  onClickChangeInputType: PropTypes.func
};

renderButtons.propTypes = {
  disabled: PropTypes.bool,
  onSubmitForm: PropTypes.func,
  onTogglePopup: PropTypes.func
};

export { ExportBackupPopup as default, PopUpModes };
