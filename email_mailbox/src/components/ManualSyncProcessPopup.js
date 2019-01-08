import React, { Component } from 'react';
import signal from '../libs/signal';
import PropTypes from 'prop-types';
import string from './../lang';
import ManualSyncDeviceAuthenticationPopup from './ManualSyncDeviceAuthenticationPopup';
import ManualSyncDeviceRejectedPopup from './ManualSyncDeviceRejectedPopup';
import ManualSyncDeviceApprovedPopup from './ManualSyncDeviceApprovedPopup';
import {
  syncStatus,
  downloadBackupFile,
  decryptBackupFile,
  importDatabase,
  clearSyncData,
  myAccount
} from '../utils/electronInterface';
import { ArrayBufferToBuffer } from '../utils/BytesUtils';
import { getDataReady, acknowledgeEvents } from '../utils/ipc';
import { appDomain, SectionType } from './../utils/const';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import {
  sendSetSectionTypeEvent,
  sendManualSyncSuccessMessage
} from '../utils/electronEventInterface';

const { messages } = string.popups.manual_sync_device_approved;

const MANUAL_SYNC_STEPS = {
  WAIT_MAILBOX: 'waiting-mailbox',
  DOWNLOAD_MAILBOX: 'download-mailbox',
  PROCESS_MAILBOX: 'process-mailbox'
};

const manualSyncModes = {
  WAITING: 'waiting',
  REJECTED: 'rejected',
  APPROVED: 'aprroved'
};

const CHECK_STATUS_DELAY = 5000;
const DATA_STATUS_DELAY = 5000;
const ANIMATION_DURATION = 1500;
const SHOW_SUCCESS_MESSAGE_DELAY = 1000;

const SYNC_PENDING_STATUS = 491;
const SYNC_DENIED_STATUS = 493;
const SYNC_APPROVED_STATUS = 200;
const DATA_READY_STATUS = 200;

const defaultOldDeviceName = `${myAccount.recipientId}@${appDomain}`;

class ManualSyncProcessPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: manualSyncModes.WAITING,
      message: messages.waitingForMailbox,
      percent: 5,
      pauseAt: 0,
      delay: 0,
      oldDeviceName: defaultOldDeviceName,
      oldDeviceIcon: 'icon-desktop',
      isCancelable: true
    };
  }

  render() {
    switch (this.state.mode) {
      case manualSyncModes.WAITING:
        return (
          <ManualSyncDeviceAuthenticationPopup
            onClickResendLoginRequest={this.props.onClickResendLoginRequest}
            onHideSettingsPopup={this.props.onHideSettingsPopup}
          />
        );
      case manualSyncModes.REJECTED:
        return (
          <ManualSyncDeviceRejectedPopup
            onHideSettingsPopup={this.props.onHideSettingsPopup}
          />
        );
      case manualSyncModes.APPROVED:
        return (
          <ManualSyncDeviceApprovedPopup
            oldDeviceIcon={this.state.oldDeviceIcon}
            newDeviceIcon={'icon-desktop'}
            message={this.state.message}
            percent={this.state.percent}
            isCancelable={this.state.isCancelable}
            onClickCancelSync={this.handleClickCancelSync}
            oldDeviceName={this.state.oldDeviceName}
          />
        );
      default:
        return null;
    }
  }

  componentDidMount() {
    this.checkManualSyncStatus();
  }

  checkManualSyncStatus = async () => {
    const { status } = await syncStatus();
    if (status === SYNC_APPROVED_STATUS) {
      clearTimeout(this.checkManualSyncStatusTimeout);
      this.setState(
        {
          mode: manualSyncModes.APPROVED
        },
        () => {
          this.checkDataStatus();
        }
      );
    } else if (status === SYNC_DENIED_STATUS) {
      clearTimeout(this.checkManualSyncStatusTimeout);
      this.setState({
        mode: manualSyncModes.REJECTED
      });
    } else if (status === SYNC_PENDING_STATUS) {
      this.checkManualSyncStatusTimeout = setTimeout(() => {
        this.checkManualSyncStatus();
      }, CHECK_STATUS_DELAY);
    }
  };

  checkDataStatus = async () => {
    const { status, body } = await getDataReady();
    if (status === DATA_READY_STATUS) {
      const { rowid, params } = body;
      const {
        dataAddress,
        key,
        authorizerId,
        authorizerType,
        authorizerName
      } = JSON.parse(params);
      acknowledgeEvents([rowid]);
      this.setState(
        {
          oldDeviceIcon: defineDeviceIcon(authorizerType),
          oldDeviceName: authorizerName
        },
        () => {
          this.downloadAndProcessMailbox(authorizerId, dataAddress, key);
        }
      );
      return;
    }
    this.dataStatusTimeout = setTimeout(
      this.checkDataStatus,
      DATA_STATUS_DELAY
    );
  };

  downloadAndProcessMailbox = (authorizerId, address, key) => {
    clearTimeout(this.dataStatusTimeout);
    this.setState(
      {
        message: messages.downloadingMailbox,
        pauseAt: 30,
        delay: (30 - this.state.percent) / ANIMATION_DURATION,
        lastStep: MANUAL_SYNC_STEPS.WAIT_MAILBOX
      },
      async () => {
        this.incrementPercentage();
        await downloadBackupFile(address);

        this.setState(
          {
            message: messages.decryptingMailbox,
            pauseAt: 70,
            delay: (70 - this.state.percent) / ANIMATION_DURATION,
            lastStep: MANUAL_SYNC_STEPS.DOWNLOAD_MAILBOX,
            isCancelable: false
          },
          async () => {
            this.incrementPercentage();
            const decryptedKey = await signal.decryptKey({
              text: key,
              recipientId: myAccount.recipientId,
              deviceId: myAccount.deviceId,
              authorizerId
            });
            await decryptBackupFile(ArrayBufferToBuffer(decryptedKey));
            await importDatabase();

            this.setState(
              {
                message: messages.syncComplete,
                pauseAt: 100,
                delay: (100 - this.state.percent) / ANIMATION_DURATION,
                lastStep: MANUAL_SYNC_STEPS.PROCESS_MAILBOX
              },
              async () => {
                this.incrementPercentage();
                clearSyncData();
                await setTimeout(() => {
                  this.props.onHideSettingsPopup();
                  sendSetSectionTypeEvent(SectionType.MAILBOX, 'inbox');
                  setTimeout(() => {
                    sendManualSyncSuccessMessage();
                  }, SHOW_SUCCESS_MESSAGE_DELAY);
                }, 3000);
              }
            );
          }
        );
      }
    );
  };

  incrementPercentage = () => {
    const percent = this.state.percent + 1;
    if (percent === this.state.pauseAt + 1) {
      clearTimeout(this.tm);
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.incrementPercentage, this.state.delay);
  };

  handleClickCancelSync = () => {
    this.props.onHideSettingsPopup();
  };
}

ManualSyncProcessPopup.propTypes = {
  onClickResendLoginRequest: PropTypes.func,
  onHideSettingsPopup: PropTypes.func
};

export { ManualSyncProcessPopup as default, MANUAL_SYNC_STEPS };
