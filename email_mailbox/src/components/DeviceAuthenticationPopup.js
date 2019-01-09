import React from 'react';
import PropTypes from 'prop-types';
import './clockLoading.scss';
import './deviceauthenticationpopup.scss';

const DeviceAuthenticationPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>Device Authentication</h1>
      </div>
      <div className="content">
        <div className="message">
          <p>Check and approve on your existing</p>
          <p>Criptext device to continue.</p>
        </div>
        <div className="loading">
          <div className="icon-clock" />
          <div className="loader">
            <div className="loader-arrow" />
          </div>

          <div className="roller">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        <div className="button">
          <p>Didn&#39;t get the prompt?</p>
          <button
            className="resend-button"
            disabled={props.disabledResendLoginRequest}
            onClick={props.onClickResendLoginRequest}
          >
            <span>
              {props.disabledResendLoginRequest ? 'Sending...' : 'Resend it '}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

DeviceAuthenticationPopup.propTypes = {
  title: PropTypes.string,
  disabledResendLoginRequest: PropTypes.bool,
  onClickResendLoginRequest: PropTypes.func
};

export default DeviceAuthenticationPopup;
