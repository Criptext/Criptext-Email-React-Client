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
  stopSocket,
  setRemoteData
} from '../utils/electronInterface';
import {
  clearSyncData,
  closeCreatingKeysLoadingWindow,
  encryptDatabaseFile,
  exportDatabase,
  linkAccept,
  linkDeny,
  postDataReady,
  throwError,
  sendEndLinkDevicesEvent,
  uploadDatabaseFile,
  logLocal,
  logErrorAndReport
} from '../utils/ipc';
import { loadingTypes } from './Panel';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import string from './../lang';
import './linkdevicerequest.scss';

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
    logLocal('Link Old Device - Init Link');
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
      logLocal('Link Old Device - Export Database');
      await exportDatabase();
      logLocal('Link Old Device - Encrypt Database');
      const { key } = await encryptDatabaseFile();
      logLocal('Link Old Device - File Ready');
      await startSocket();
      const { session, deviceId } = this.state.remoteData;
      const { randomId } = session;
      this.setState(
        {
          message: messages.gettingKeys,
          pauseAt: 50,
          delay: (50 - this.state.percent) / ANIMATION_DURATION,
          lastStep: STEPS.ENCRYPT_MAILBOX,
          retryData: { randomId, deviceId, key }
        },
        async () => {
          this.incrementPercentage();
          await this.uploadFile(randomId, deviceId, key);
        }
      );
    } catch (e) {
      logErrorAndReport(e.stack);
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
    logLocal('Link Old Device - Upload File');
    const { statusCode } = await uploadDatabaseFile(randomId);
    if (statusCode !== 200) {
      logLocal(`Link Old Device - Unable to Upload File ${statusCode}`);
      this.linkingDevicesThrowError();
      return;
    }
    logLocal('Link Old Device - Encrypt Key');
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
        logLocal('Link Old Device - Post Data');
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

  handleClickRetry = () => {
    const step = this.state.lastStep;
    switch (step) {
      case STEPS.ENCRYPT_MAILBOX: {
        const { randomId, deviceId, key } = this.state.retryData;
        this.setState(
          {
            failed: false
          },
          () => {
            this.uploadFile(randomId, deviceId, key);
          }
        );
        return;
      }
      default: {
        return;
      }
    }
  };
}

export { LinkOldDeviceWrapper as default, STEPS };
