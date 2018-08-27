import React from 'react';
import PropTypes from 'prop-types';
import './deviceremovedpopup.css';

const DeviceRemovedPopup = () => {
  return (
    <div className="deviceremoved-container">
      <div className="deviceremoved-title">Device Removed</div>
      <div className="deviceremoved-text">
        <div className="text">
          This device was removed from another of your devices
        </div>
        <div className="text">The app will be closed in few seconds...</div>
      </div>
    </div>
  );
};

DeviceRemovedPopup.propTypes = {
  title: PropTypes.string
};

export default DeviceRemovedPopup;
