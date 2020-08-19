import React from 'react';
import PropTypes from 'prop-types';
import './norecoverypopup.scss';

import string from '../../lang';

const { popup } = string.setup.recovery;

const ErrorPopup = props => (
  <div className="recovery-popup-content">
    <div className="popup-title">
      <h1>{popup.title}</h1>
    </div>
    <p>{popup.message}</p>
    <div className="popup-buttons">
      <button className="cancel-button" onClick={props.onClickSkip}>
        {popup.buttons.skip}
      </button>
      <button className="main-button" onClick={props.onClickCancel}>
        {popup.buttons.cancel}
      </button>
    </div>
  </div>
);

export default ErrorPopup;
