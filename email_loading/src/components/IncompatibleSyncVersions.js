import React from 'react';
import string from './../lang';
import './linkdevicerequest.scss';
import {
  closeCreatingKeysLoadingWindow,
  sendEndLinkDevicesEvent
} from '../utils/ipc';

const { header, text, buttonLabels } = string.incompatibleSyncVersions;

const IncompatibleSyncVersions = () => (
  <div className="incompatible-versions-container">
    <div className="content">
      <div className="header">
        <h3>{header}</h3>
      </div>

      <div className="text">
        <span>{text}</span>
      </div>

      <div className="buttons">
        <button
          className="button-a aprove-button"
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
