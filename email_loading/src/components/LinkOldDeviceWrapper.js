import React, { Component } from 'react';
import LinkOldDevice from './LinkOldDevice';
import LinkDeviceRequest from './LinkDeviceRequest';
import IncompatibleSyncVersions from './IncompatibleSyncVersions';
import signal from '../libs/signal';
import {
  remoteData,
  loadingType,
  startSocket,
  myAccount,
  exportDatabase,
  stopSocket,
  encryptDatabaseFile,
  uploadDatabaseFile,
  setRemoteData
} from '../utils/electronInterface';
import {
  clearSyncData,
  closeCreatingKeysLoadingWindow,
  linkAccept,
  linkDeny,
  postDataReady,
  throwError,
  sendEndLinkDevicesEvent
} from '../utils/ipc';
import { loadingTypes } from './Panel';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import string from './../lang';

const messages = string.linkOldDevice.messages;

const ANIMATION_DURATION = 1500;
const INCOMPATIBLE_VERSIONS_STATUS = 405;

const STEPS = {
  NOT_STARTED: 'not-started',
  ENCRYPT_MAILBOX: 'encrypting-mailbox',
  GETTING_KEYS: 'getting-keys',
  UPLOAD_MAILBOX: 'uploading-mailbox',
  SYNC_COMPLETE: 'sync-complete'
};

class LinkOldDeviceWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      percent: 0,
      newAccountData: undefined,
      pauseAt: 0,
      delay: 0,
      failed: false,
      lastStep: STEPS.NOT_STARTED,
      oldDeviceName: '',
      type: loadingType,
      remoteData
    };
  }

  render() {
    switch (this.state.type) {
      case loadingTypes.LINK_DEVICE_REQUEST: {
        return (
          <LinkDeviceRequest
            {...remoteData}
            onAcceptLinkDeviceRequest={this.handleAcceptLinkDeviceRequest}
            onDenyLinkDeviceRequest={this.handleDenyLinkDeviceRequest}
          />
        );
      }
      case loadingTypes.LINK_OLD_DEVICE: {
        return (
          <LinkOldDevice
            failed={this.state.failed}
            message={this.state.message}
            percent={this.state.percent}
            lastStep={this.state.lastStep}
            onClickRetry={this.handleClickRetry}
            onClickCancelSync={this.handleClickCancelSync}
            oldDeviceName={this.state.oldDeviceName}
            oldDeviceIcon={'icon-desktop'}
            newDeviceIcon={this.defineRemoteDeviceIcon()}
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

  handleAcceptLinkDeviceRequest = async () => {
    const { randomId } = remoteData.session;
    const { status, body } = await linkAccept(randomId);
    if (status === 200) {
      const { deviceId } = body;
      const newRemoteData = { ...remoteData, deviceId };
      setRemoteData({});
      this.setState(
        {
          type: loadingTypes.LINK_OLD_DEVICE,
          remoteData: newRemoteData,
          oldDeviceName: remoteData.deviceFriendlyName
        },
        () => {
          this.initLinkOldDevice();
        }
      );
    } else if (status === INCOMPATIBLE_VERSIONS_STATUS) {
      this.setState({
        type: loadingTypes.INCOMPATIBLE_VERSIONS
      });
    }
  };

  handleDenyLinkDeviceRequest = async () => {
    const { randomId } = remoteData.session;
    await linkDeny(randomId);
    closeCreatingKeysLoadingWindow();
    sendEndLinkDevicesEvent();
  };

  initLinkOldDevice = () => {
    this.setState(
      {
        message: messages.encryptingMailbox,
        pauseAt: 25,
        lastStep: STEPS.NOT_STARTED
      },
      async () => {
        this.incrementPercentage();
        await setTimeout(async () => {
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
          message: messages.gettingKeys,
          pauseAt: 50,
          delay: (50 - this.state.percent) / ANIMATION_DURATION,
          lastStep: STEPS.ENCRYPT_MAILBOX
        },
        async () => {
          this.incrementPercentage();
          const { session, deviceId } = this.state.remoteData;
          const { randomId } = session;
          await this.uploadFile(randomId, deviceId, key);
        }
      );
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        throwError(string.errors.unableToConnect);
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
          pauseAt: 75,
          delay: (75 - this.state.percent) / ANIMATION_DURATION,
          lastStep: STEPS.GETTING_KEYS
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
              delay: (100 - this.state.percent) / ANIMATION_DURATION,
              lastStep: STEPS.UPLOAD_MAILBOX
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
      const { name, description } = string.errors.unableToConnect;
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

export { LinkOldDeviceWrapper as default, STEPS };
