import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './devicenotapproved.scss';

const { deviceNotApproved } = string;

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
      <h4>{deviceNotApproved.title}</h4>
    </div>
    <div className="content-message">
      <p>{deviceNotApproved.message}</p>
      <div className="content-icon">
        <div className="icon-warning" />
      </div>
      <p>
        <strong>{deviceNotApproved.warning.strong} </strong>{' '}
        {deviceNotApproved.warning.text}
      </p>
    </div>
    {!props.hasTwoFactorAuth && (
      <div className="cant-access">
        <span onClick={props.onClickSignInWithPassword}>
          {deviceNotApproved.passwordLoginLabel}
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
