import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './updatepopup.scss';

const { once, last } = string.popups.enable_backup;

const EnableAutoBackup = props => {
  if (props.step === 1) {
    return <EnableAutoBackupOnce {...props} />;
  }
  return <EnableAutoBackupLast {...props} />;
};

const EnableAutoBackupOnce = props => {
  return (
    <div className="popup-content update-popup enable-auto-backup">
      <div className="popup-backup-img" />
      <div className="popup-title">
        <h1>{once.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{once.description}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onEnableBackup}
        >
          <span>{once.buttons.enable}</span>
        </button>
        <button
          className="button-a popup-cancel-button"
          onClick={props.onNoBackup}
        >
          <span>{once.buttons.cancel}</span>
        </button>
      </div>
    </div>
  );
};

const EnableAutoBackupLast = props => {
  return (
    <div className="popup-content update-popup enable-auto-backup">
      <div className="popup-title">
        <h1>{last.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{last.description}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onEnableBackup}
        >
          <span>{last.buttons.enable}</span>
        </button>
        <button
          className="button-a popup-cancel-button"
          onClick={props.onNoBackup}
        >
          <span>{last.buttons.cancel}</span>
        </button>
      </div>
    </div>
  );
};

EnableAutoBackup.propTypes = {
  step: PropTypes.number
};

EnableAutoBackupOnce.propTypes = {
  onEnableBackup: PropTypes.func,
  onNoBackup: PropTypes.func
};

EnableAutoBackupLast.propTypes = {
  onEnableBackup: PropTypes.func,
  onNoBackup: PropTypes.func
};

export default EnableAutoBackup;
