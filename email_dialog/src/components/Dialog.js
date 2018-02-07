import React from 'react';
import { onResponseModal } from './../utils/electronInterface';
import './dialog.css';


const Dialog = () => renderDialog();


const renderDialog = () => (
  <div className="dialog-body">
    <div className="header"></div>

    <div className="content">
      <h2 className="title">Warning!</h2>

      <div className="message">
        <p>
          You did not set a <strong>Recovery Email</strong> so account recovery is impossible if you forget your password.
        </p>
        <p>
          Proceed without recovery email?
        </p>
      </div>

      <div className="options">
        <button className="cancel" onClick={(e) => onResponseModal(e, "Cancel")}>
          <span>Cancel</span>
        </button>
        <button className="confirm" onClick={(e) => onResponseModal(e, "Confirm")}>
          <span>Confirm</span>
        </button>
      </div>

    </div>
  </div>
)


export default Dialog;
