import React from 'react';
import string from './../lang';

const { title, prefix, suffix } = string.popups.device_removed;

const DeviceRemovedPopup = () => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{prefix}</p>
        <p>{suffix}</p>
      </div>
    </div>
  );
};

export default DeviceRemovedPopup;
