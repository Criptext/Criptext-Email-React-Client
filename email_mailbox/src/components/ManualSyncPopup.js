import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const {
  title,
  paragraphs,
  cancelButtonLabel,
  confirmButtonLabel
} = string.popups.manual_sync;

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
        <p>{paragraphs.question}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelManualSync}
        >
          <span>{cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmManualSync}
        >
          <span>{confirmButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

ManualSyncPopup.propTypes = {
  onClickCancelManualSync: PropTypes.func,
  onClickConfirmManualSync: PropTypes.func
};

export default ManualSyncPopup;
