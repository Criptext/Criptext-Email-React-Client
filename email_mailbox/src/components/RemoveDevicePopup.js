import React from 'react';
import PropTypes from 'prop-types';
import './removedevicepopup.css';

const RemoveDevicePopup = props => {
  return (
    <div className="logout-popup-content">
      <div className="logout-popup-title">
        <h1>Remove Device</h1>
      </div>
      <div className="logout-popup-warning-text">
        Removing access will automatically sign you out of your account on this
        device.
      </div>
      <div className="logout-popup-password-text">
        To confirm enter your password
      </div>
      <div className="logout-popup-password-input">
        <input
          type="password"
          value={props.password}
          onChange={ev => props.onChangeRemoveDeviceInputPassword(ev)}
        />
      </div>
      <div className="logout-popup-buttons">
        <button
          className="button button-a logout-cancel-button"
          onClick={props.onClickCancelRemoveDevice}
        >
          Cancel
        </button>
        <button
          className="button button-a logout-remove-button"
          onClick={props.onRemoveDevice}
          disabled={!props.password.length || props.password.length < 1}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

RemoveDevicePopup.propTypes = {
  password: PropTypes.string,
  onChangeRemoveDeviceInputPassword: PropTypes.func,
  onClickCancelRemoveDevice: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default RemoveDevicePopup;
