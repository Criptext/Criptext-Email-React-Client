import React from 'react';
import PropTypes from 'prop-types';
import './errorpopup.scss';

const ErrorPopup = props => (
  <div className="error-popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>
    <p>{props.message}</p>
    <div className="popup-buttons">
      <button onClick={props.onClickDismiss}>{props.button}</button>
    </div>
  </div>
);

export default ErrorPopup;
