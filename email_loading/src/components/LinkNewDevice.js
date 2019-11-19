import React from 'react';
import PropTypes from 'prop-types';
import { STEPS } from './LinkNewDeviceWrapper';
import string from './../lang';
import './linkingdevices.scss';

const { linkNewDevice } = string;

const LinkNewDevice = props => (
  <div className="dialog-container link-container">
    <div className="dialog-content">
      <div className="dialog-content-header">
        <h1>{linkNewDevice.header}</h1>
      </div>
      <div className="dialog-content-body">
        <div className="linking-devices-icons">
          <i className={`${props.oldDeviceIcon} icon-old-device`} />
          <div className="linking-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <i className={`${props.newDeviceIcon} icon-new-device`} />
        </div>
        <div className="bar">
          <div
            className={`content running-animation`}
            style={{ width: props.percent + '%' }}
          />
        </div>
        <div className="percent">
          <div className="content">
            <span className="number">{props.percent}%</span>
          </div>
        </div>
        <div className="message">{renderMessage(props)}</div>
        <div className="device-name">
          <span>{props.oldDeviceName}</span>
        </div>
        {renderCancelSync(props)}
      </div>
    </div>
  </div>
);

const renderMessage = props => {
  if (props.failed) {
    return (
      <div className="retry">
        <span>{linkNewDevice.messages.error} </span>
        <span className="retry-link" onClick={props.onClickRetry}>
          {linkNewDevice.messages.retry}
        </span>
      </div>
    );
  }
  return <span className="syncing"> {props.message}</span>;
};

const renderCancelSync = props => {
  const availableCancelSyncSteps = [STEPS.NOT_STARTED, STEPS.SEND_KEYS];
  return availableCancelSyncSteps.includes(props.lastStep) ? (
    <div className="cancel-sync-link" onClick={props.onClickCancelSync}>
      <span>{linkNewDevice.cancelSyncLabel}</span>
      {props.showContinueWaitingButton && (
        <button
          className="keep-waiting-button"
          onClick={props.onClickKeepWaiting}
        >
          {linkNewDevice.continueLabel}
        </button>
      )}
    </div>
  ) : props.lastStep === STEPS.WAIT_MAILBOX ? (
    <div className="cancel-sync-link" onClick={props.onClickCancelSync}>
      <span>{linkNewDevice.skipStepLabel}</span>
    </div>
  ) : null;
};

LinkNewDevice.propTypes = {
  newDeviceIcon: PropTypes.string,
  oldDeviceIcon: PropTypes.string,
  oldDeviceName: PropTypes.string,
  percent: PropTypes.number
};

renderMessage.propTypes = {
  failed: PropTypes.bool,
  message: PropTypes.string,
  onClickRetry: PropTypes.func
};

renderCancelSync.propTypes = {
  lastStep: PropTypes.string,
  onClickCancelSync: PropTypes.func,
  showContinueWaitingButton: PropTypes.bool,
  onClickKeepWaiting: PropTypes.func
};

export default LinkNewDevice;
