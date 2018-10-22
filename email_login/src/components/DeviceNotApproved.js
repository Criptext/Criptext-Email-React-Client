import React from 'react';
import PropTypes from 'prop-types';
import './devicenotapproved.scss';

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
      <h4>Sign In Rejected</h4>
    </div>
    <div className="content-message">
      <p>
        Your request to access this account was rejected by a verified device.
      </p>
      <div className="content-icon">
        <div className="icon-warning" />
      </div>
      <p>
        <strong>Warning: </strong> Multiple rejections could lead your device to
        be blacklisted from Criptext.
      </p>
    </div>
    {!props.hasTwoFactorAuth && (
      <div className="cant-access">
        <span onClick={ev => props.onClickSignInWithPassword(ev)}>
          Sign In with password
        </span>
      </div>
    )}
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderHeader.propTypes = {
  toggleDeviceNotApproved: PropTypes.func
};

// eslint-disable-next-line fp/no-mutation
renderContent.propTypes = {
  hasTwoFactorAuth: PropTypes.bool,
  onClickSignInWithPassword: PropTypes.func
};

export default DeviceNotApproved;
