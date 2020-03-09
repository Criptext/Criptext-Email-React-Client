import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const DeleteAliasPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.delete_alias.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.delete_alias.description}</p>
        <p>
          {string.formatString(
            string.popups.delete_alias.question,
            <b>{props.email}</b>
          )}
        </p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>{string.popups.delete_alias.buttons.cancelLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onConfirmDeleteAlias}
        >
          <span>{string.popups.delete_alias.buttons.continueLabel}</span>
        </button>
      </div>
    </div>
  );
};

DeleteAliasPopup.propTypes = {
  email: PropTypes.string,
  onTogglePopup: PropTypes.func,
  onConfirmDeleteAlias: PropTypes.func
};

export default DeleteAliasPopup;
