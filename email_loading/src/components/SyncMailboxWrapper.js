import React, { Component } from 'react';
import SyncMailbox from './SyncMailbox';
import LinkDeviceRequest from './LinkDeviceRequest';
import IncompatibleSyncVersions from './IncompatibleSyncVersions';
import signal from '../libs/signal';
import {
  remoteData,
  loadingType,
  startSocket,
  clearSyncData,
  myAccount,
  exportDatabase,
  stopSocket,
  encryptDatabaseFile,
  uploadDatabaseFile,
  setRemoteData,
  errors
} from '../utils/electronInterface';
import {
  syncDeny,
  throwError,
  syncAccept,
  postDataReady,
  closeCreatingKeysLoadingWindow,
  sendEndLinkDevicesEvent
} from '../utils/ipc';
import { loadingTypes } from './Panel';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import string from './../lang';

const { messages } = string.linkOldDevice;
const ANIMATION_DURATION = 1500;
const INCOMPATIBLE_VERSIONS_STATUS = 405;

const STEPS = {
  NOT_STARTED: 'not-started',
  ENCRYPT_MAILBOX: 'encrypting-mailbox',
  UPLOAD_MAILBOX: 'uploading-mailbox',
  SYNC_COMPLETE: 'sync-complete'
};

class SyncMailboxWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      percent: 5,
      pauseAt: 0,
      delay: 0,
      oldDeviceName: '',
      type: loadingType,
      remoteData,
      isCancelable: true
    };
  }

  render() {
    switch (this.state.type) {
      case loadingTypes.SYNC_MAILBOX_REQUEST: {
        return (
          <LinkDeviceRequest
            {...remoteData}
            onAcceptLinkDeviceRequest={this.handleAcceptSyncDeviceRequest}
            onDenyLinkDeviceRequest={this.handleDenySyncDeviceRequest}
          />
        );
      }
      case loadingTypes.SYNC_MAILBOX_OLD_DEVICE: {
        return (
          <SyncMailbox
            message={this.state.message}
            percent={this.state.percent}
            onClickCancelSync={this.handleClickCancelSync}
            oldDeviceName={this.state.oldDeviceName}
            oldDeviceIcon={'icon-desktop'}
            newDeviceIcon={this.defineRemoteDeviceIcon()}
            isCancelable={this.state.isCancelable}
          />
        );
      }
      case loadingTypes.INCOMPATIBLE_VERSIONS: {
        return <IncompatibleSyncVersions />;
      }
      default:
        return null;
    }
  }

  handleAcceptSyncDeviceRequest = async () => {
    const { randomId } = remoteData;
    const { status } = await syncAccept(randomId);
    if (status === 200) {
      setRemoteData({});
      this.setState(
        {
          type: loadingTypes.SYNC_MAILBOX_OLD_DEVICE,
          remoteData,
          oldDeviceName: remoteData.deviceFriendlyName
        },
        () => {
          this.initSyncMailbox();
        }
      );
    } else if (status === INCOMPATIBLE_VERSIONS_STATUS) {
      this.setState({
        type: loadingTypes.INCOMPATIBLE_VERSIONS
      });
    }
  };

  handleDenySyncDeviceRequest = async () => {
    const { randomId } = remoteData;
    await syncDeny(randomId);
    closeCreatingKeysLoadingWindow();
    sendEndLinkDevicesEvent();
  };

  initSyncMailbox = () => {
    this.setState(
      {
        message: messages.encryptingMailbox,
        pauseAt: 30
      },
      () => {
        this.incrementPercentage();
        setTimeout(async () => {
          await this.exportDatabase();
        }, ANIMATION_DURATION);
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

  exportDatabase = async () => {
    try {
      await stopSocket();
      await exportDatabase();
      const { key } = await encryptDatabaseFile();
      await startSocket();
      this.setState(
        {
          message: messages.uploadingMailbox,
          pauseAt: 70,
          delay: (70 - this.state.percent) / ANIMATION_DURATION,
          isCancelable: false
        },
        async () => {
          this.incrementPercentage();
          const { randomId, deviceId } = this.state.remoteData;
          await this.uploadFile(randomId, deviceId, key);
        }
      );
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        throwError(errors.server.UNABLE_TO_CONNECT);
      } else {
        throwError({
          name: e.name,
          description: e.description || e.message
        });
      }
      this.linkingDevicesThrowError();
    }
  };

  uploadFile = async (randomId, deviceId, key) => {
    const { statusCode } = await uploadDatabaseFile(randomId);
    if (statusCode === 200) {
      const keyEncrypted = await signal.encryptKeyForNewDevice({
        recipientId: myAccount.recipientId,
        deviceId,
        key
      });
      this.setState(
        {
          message: messages.uploadingMailbox,
          pauseAt: 90,
          delay: (90 - this.state.percent) / ANIMATION_DURATION
        },
        async () => {
          this.incrementPercentage();
          await postDataReady({
            deviceId,
            key: keyEncrypted
          });
          this.setState(
            {
              message: messages.uploadSuccess,
              pauseAt: 100,
              delay: (100 - this.state.percent) / ANIMATION_DURATION
            },
            async () => {
              this.incrementPercentage();
              await setTimeout(() => {
                clearSyncData();
                closeCreatingKeysLoadingWindow();
                sendEndLinkDevicesEvent();
              }, 4000);
            }
          );
        }
      );
    } else {
      clearSyncData();
      const { name, description } = errors.linkDevices.UPLOAD_DATA;
      throwError({
        name,
        description: description + statusCode
      });
    }
  };

  handleClickCancelSync = () => {
    clearSyncData();
    closeCreatingKeysLoadingWindow();
    sendEndLinkDevicesEvent();
  };

  defineRemoteDeviceIcon = () =>
    defineDeviceIcon(remoteData.deviceType || this.state.remoteData.deviceType);

  linkingDevicesThrowError = () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true
    });
  };
}

export { SyncMailboxWrapper as default, STEPS };
