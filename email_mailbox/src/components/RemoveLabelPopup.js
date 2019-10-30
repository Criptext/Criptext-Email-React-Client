import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const RemoveLabelPopup = props => {
  return (
    <div id="popup-removedevice" className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.remove_label.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>
          {string.formatString(
            string.popups.remove_label.message,
            <b>{props.labelToDelete.text}</b>
          )}
        </p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelRemoveLabel}
        >
          <span>{string.popups.remove_label.cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmRemoveLabel}
        >
          <span>{string.popups.remove_label.confirmButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

RemoveLabelPopup.propTypes = {
  labelToDelete: PropTypes.object,
  onClickCancelRemoveLabel: PropTypes.func,
  onClickConfirmRemoveLabel: PropTypes.func
};

export default RemoveLabelPopup;
