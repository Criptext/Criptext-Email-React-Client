import React from 'react';
import string from './../lang';
import './changeaccountpopup.scss';

const { title, description } = string.popups.change_account;

const ChangeAccountPopup = () => {
  return (
    <div id="cptx-change-account" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="cptx-linear-animate">
        <div className="cptx-indeterminate" />
      </div>
      <div className="popup-paragraph">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ChangeAccountPopup;
