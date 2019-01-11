import React, { Component } from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import { syncBegin } from '../utils/ipc';
import './manualsyncpopup.scss';

const {
  title,
  paragraphs,
  cancelButtonLabel,
  confirmButtonLabel
} = string.popups.mailbox_sync;

class ManualSyncPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableSubmitButton: false
    };
  }

  render() {
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
            onClick={this.handleClickCancelWarning}
          >
            <span>{cancelButtonLabel}</span>
          </button>
          <button
            className="button-a popup-confirm-button"
            onClick={this.handleOnClickConfirm}
            disabled={this.state.disableSubmitButton}
          >
            <span>{confirmButtonLabel}</span>
          </button>
        </div>
      </div>
    );
  }

  handleClickCancelWarning = () => {
    this.props.onHideSettingsPopup();
  };

  handleOnClickConfirm = () => {
    this.setState({ disableSubmitButton: true }, async () => {
      const { status } = await syncBegin();
      if (status === 200) {
        const popupType =
          SETTINGS_POPUP_TYPES.MANUAL_SYNC_DEVICE_AUTHENTICATION;
        this.props.onShowSettingsPopup(popupType);
      }
      this.setState({ disableSubmitButton: false });
    });
  };
}

ManualSyncPopup.propTypes = {
  onHideSettingsPopup: PropTypes.func,
  onShowSettingsPopup: PropTypes.func
};

export default ManualSyncPopup;
