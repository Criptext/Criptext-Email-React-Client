import React, { Component } from 'react';
import signal from '../libs/signal';
import {
  closeCreatingKeys,
  remoteData,
  loadingType,
  startSocket,
  clearSyncData,
  myAccount,
  exportDatabase,
  stopSocket,
  encryptDatabaseFile,
  postDataReady,
  uploadDatabaseFile,
  throwError,
  setRemoteData,
  linkAccept,
  linkDeny,
  sendEndLinkDevicesEvent,
  errors
} from '../utils/electronInterface';
import LinkOldDevice from './LinkOldDevice';
import { loadingTypes } from './Panel';
import LinkDeviceRequest from './LinkDeviceRequest';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';

const ANIMATION_DURATION = 1500;

const STEPS = {
  NOT_STARTED: 'not-started',
  ENCRYPT_MAILBOX: 'encrypting-mailbox',
  GETTING_KEYS: 'getting-keys',
  UPLOAD_MAILBOX: 'uploading-mailbox',
  SYNC_COMPLETE: 'sync-complete'
};

class LoadingWrapper extends Component {
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
    if (this.state.type === loadingTypes.LINK_DEVICE_REQUEST) {
      return (
        <LinkDeviceRequest
          {...remoteData}
          onAcceptLinkDeviceRequest={this.handleAcceptLinkDeviceRequest}
          onDenyLinkDeviceRequest={this.handleDenyLinkDeviceRequest}
        />
      );
    }
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
    }
  };

  handleDenyLinkDeviceRequest = async () => {
    const { randomId } = remoteData.session;
    await linkDeny(randomId);
    closeCreatingKeys();
    sendEndLinkDevicesEvent();
  };

  initLinkOldDevice = () => {
    this.setState(
      {
        message: 'Encrypting Mailbox',
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
          message: 'Getting keys',
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
          message: 'Uploading Mailbox',
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
              message: 'Mailbox uploaded successfully!',
              pauseAt: 100,
              delay: (100 - this.state.percent) / ANIMATION_DURATION,
              lastStep: STEPS.UPLOAD_MAILBOX
            },
            async () => {
              this.incrementPercentage();
              await setTimeout(() => {
                clearSyncData();
                closeCreatingKeys();
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
    closeCreatingKeys();
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

export { LoadingWrapper as default, STEPS };
