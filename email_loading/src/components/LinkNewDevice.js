import React from 'react';
import PropTypes from 'prop-types';
import './linkingdevices.css';
import { STEPS } from './LinkNewDeviceWrapper';

const LinkNewDevice = props => (
  <div className="linking-container">
    <div className="content">
      <div className="header">
        <h3>Mailbox Sync</h3>
      </div>
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
);

const renderMessage = props => {
  if (props.failed) {
    return (
      <div className="retry">
        <span>Error syncing your mailbox. </span>
        <span className="retry-link" onClick={props.onClickRetry}>
          Retry
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
      <span>Cancel sync</span>
      {props.showContinueWaitingButton && (
        <button
          className="keep-waiting-button"
          onClick={props.onClickKeepWaiting}
        >
          Continue
        </button>
      )}
    </div>
  ) : props.lastStep === STEPS.WAIT_MAILBOX ? (
    <div className="cancel-sync-link" onClick={props.onClickCancelSync}>
      <span>Skip step</span>
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
  failed: PropTypes.boolean,
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
