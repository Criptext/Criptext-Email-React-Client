import React from 'react';
import PropTypes from 'prop-types';
import './devicenotapproved.css';

const DeviceNotApproved = props => (
  <div className="device-not-approved-container">
    {renderHeader(props)}
    {renderContent(props)}
  </div>
);

const renderHeader = props => (
  <div className="device-not-approved-header">
    <button className="back-button" onClick={props.toggleDeviceNotApproved}>
      <i className="icon-back" />
    </button>
    <div className="criptext-logo">
      <div className="icon" />
    </div>
  </div>
);

const renderContent = props => (
  <div className="device-not-approved-content">
    <div className="content-header">
      <h4>Sign In</h4>
    </div>
    <div className="content-icon">
      <div className="icon-exit" />
    </div>
    <div className="content-message">
      <p>
        Your request to access this account was rejected by a verified device.
      </p>
      <p>
        Multiple rejections could lead your device to be blacklisted from
        Criptext.
      </p>
    </div>
    <div className="cant-access">
      <span onClick={ev => props.onClickSignInWithPassword(ev)}>
        Sign In with password
      </span>
    </div>
  </div>
);

renderHeader.propTypes = {
  toggleDeviceNotApproved: PropTypes.func
};

renderContent.propTypes = {
  onClickSignInWithPassword: PropTypes.func
};

export default DeviceNotApproved;
