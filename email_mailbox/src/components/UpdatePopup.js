import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './updatepopup.scss';

const { title, buttons } = string.popups.new_update;

const UpdatePopup = props => {
  return (
    <div className="popup-content update-popup">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-img">
        <img alt="update preview" src={props.largeImageUrl} />
      </div>
      <div className="popup-subtitle">
        <p>{props.title}</p>
      </div>
      <div
        className={`popup-paragraph ${
          props.showUpdateNow ? '' : 'popup-bottom-margin'
        }`}
      >
        <p>{props.body}</p>
      </div>
      {props.showUpdateNow && (
        <div className="popup-buttons">
          <button
            className="button-a popup-confirm-button"
            onClick={props.onUpdateNow}
          >
            <span>{buttons.update}</span>
          </button>
          <button
            className="button-a popup-cancel-button"
            onClick={props.onTogglePopup}
          >
            <span>{buttons.later}</span>
          </button>
        </div>
      )}
    </div>
  );
};

UpdatePopup.propTypes = {
  body: PropTypes.string,
  largeImageUrl: PropTypes.string,
  title: PropTypes.string,
  onTogglePopup: PropTypes.func,
  onUpdateNow: PropTypes.func,
  showUpdateNow: PropTypes.bool
};

export default UpdatePopup;
