import React from 'react';
import PropTypes from 'prop-types';

const DeviceRemovedPopup = () => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>Device Removed</h1>
      </div>
      <div className="popup-paragraph">
        <p>This device was removed from another of your devices</p>
        <p>The app will be closed in few seconds...</p>
      </div>
    </div>
  );
};

DeviceRemovedPopup.propTypes = {
  title: PropTypes.string
};

export default DeviceRemovedPopup;
