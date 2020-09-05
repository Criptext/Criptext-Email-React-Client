import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const api = string.popups.api_version;

const ApiVersionPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{api.title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>{api.description}</p>
    </div>
    <div className="popup-buttons">
      <a href="https://criptext.com/dl">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onUpdateExternal}
        >
          <span>{api.buttons.external}</span>
        </button>
      </a>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onUpdateLocal}
      >
        <span>{api.buttons.local}</span>
      </button>
    </div>
  </div>
);

ApiVersionPopup.propTypes = {
  onUpdateExternal: PropTypes.func,
  onUpdateLocal: PropTypes.func
};

export default ApiVersionPopup;
