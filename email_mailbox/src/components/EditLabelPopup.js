import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const EditLabelPopup = props => {
  return (
    <div id="popup-removedevice" className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.edit_label.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.edit_label.message}</p>
      </div>
      <div className="popup-inputs">
        <EditLabelPopupInput
          value={props.newLabel}
          onChangeValue={props.onChangeEditLabel}
          placeholder={props.labelToEdit.text}
        />
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onClickCancelEditLabel}
        >
          <span>{string.popups.edit_label.cancelButtonLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onClickConfirmEditLabel}
        >
          <span>{string.popups.edit_label.confirmButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

const EditLabelPopupInput = ({ value, onChangeValue, placeholder }) => (
  <div className="popup-input">
    <input
      type="text"
      value={value}
      onChange={ev => onChangeValue(ev)}
      placeholder={placeholder}
      autoFocus={true}
    />
  </div>
);

EditLabelPopup.propTypes = {
  labelToDelete: PropTypes.object,
  onClickCancelRemoveLabel: PropTypes.func,
  onClickConfirmRemoveLabel: PropTypes.func
};

export default EditLabelPopup;
