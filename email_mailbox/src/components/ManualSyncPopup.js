import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import { syncBegin } from '../utils/electronInterface';
import './manualsyncpopup.scss';

const {
  title,
  paragraphs,
  cancelButtonLabel,
  confirmButtonLabel
} = string.popups.mailbox_sync;

const ManualSyncPopup = props => {
  return (
    <div id="popup-manual-sync" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraphs.header}</p>
      </div>
      <div className="popup-paragraph">
        <p>
          <strong>{paragraphs.question}</strong>
        </p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onHideSettingsPopup}
        >
          <span>{cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={async () => {
            const { status } = await syncBegin();
            if (status === 200) {
              const popupType =
                SETTINGS_POPUP_TYPES.MANUAL_SYNC_DEVICE_AUTHENTICATION;
              props.onShowSettingsPopup(popupType);
            }
          }}
        >
          <span>{confirmButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

ManualSyncPopup.propTypes = {
  onHideSettingsPopup: PropTypes.func,
  onShowSettingsPopup: PropTypes.func
};

export default ManualSyncPopup;
