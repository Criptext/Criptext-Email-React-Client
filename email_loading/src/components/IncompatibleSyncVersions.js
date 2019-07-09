import React from 'react';
import string from './../lang';
import './linkdevicerequest.scss';
import {
  closeCreatingKeysLoadingWindow,
  sendEndLinkDevicesEvent
} from '../utils/ipc';

const { header, text, buttonLabels } = string.incompatibleSyncVersions;

const IncompatibleSyncVersions = () => (
  <div className="dialog-container">
    <div className="dialog-content">
      <div className="dialog-content-header">
        <h1>{header}</h1>
      </div>
      <div className="dialog-content-body">
        <p>{text}</p>
      </div>
      <div className="dialog-content-buttons">
        <button
          className="button-a button-confirm"
          onClick={() => {
            sendEndLinkDevicesEvent();
            closeCreatingKeysLoadingWindow();
          }}
        >
          <span>{buttonLabels.close}</span>
        </button>
      </div>
    </div>
  </div>
);

export default IncompatibleSyncVersions;
