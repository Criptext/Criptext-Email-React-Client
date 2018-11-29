import React, { Component } from 'react';
import signal from '../libs/signal';
import {
  closeCreatingKeys,
  remoteData,
  downloadBackupFile,
  startSocket,
  decryptBackupFile,
  importDatabase,
  clearSyncData,
  getDataReady,
  acknowledgeEvents,
  throwError,
  errors
} from '../utils/electronInterface';
import { openMailbox } from './../utils/ipc';
import LinkNewDevice from './LinkNewDevice';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';
import { ArrayBufferToBuffer } from '../utils/BytesUtils';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import { appDomain } from '../utils/const';

const ANIMATION_DURATION = 1500;
const DATA_STATUS_DELAY = 5000;
const DATA_READY_STATUS = 200;
const DATA_STATUS_RETRIES = 12;
let DATA_STATUS_ATTEMPS = DATA_STATUS_RETRIES;

const STEPS = {
  NOT_STARTED: 'not-started',
  SEND_KEYS: 'send-keys',
  WAIT_MAILBOX: 'waiting-for-mailbox',
  DOWNLOAD_MAILBOX: 'downloading-mailbox',
  PROCESS_MAILBOX: 'processing-mailbox',
  SYNC_COMPLETE: 'sync-complete'
};

const LINK_DEVICE_EMAIL_ADDRESS = `${remoteData.recipientId}@${appDomain}`;

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
      oldDeviceName: LINK_DEVICE_EMAIL_ADDRESS,
      showContinueWaitingButton: false
    };

    addEvent(Event.DATA_UPLOADED, this.downloadAndProcessMailbox);
  }

  componentDidMount() {
    this.setState({ message: 'Sending keys', pauseAt: 10 }, async () => {
      this.incrementPercentage();
      await setTimeout(async () => {
        await this.uploadKeys();
      }, ANIMATION_DURATION);
    });
  }

  render() {
    return (
      <LinkNewDevice
        failed={this.state.failed}
        message={this.state.message}
        percent={this.state.percent}
        lastStep={this.state.lastStep}
        onClickRetry={this.handleClickRetry}
        onClickCancelSync={this.handleClickCancelSync}
        oldDeviceName={this.state.oldDeviceName}
        showContinueWaitingButton={this.state.showContinueWaitingButton}
        onClickKeepWaiting={this.handleClickKeepWaiting}
        oldDeviceIcon={this.defineRemoteDeviceIcon()}
        newDeviceIcon={'icon-desktop'}
      />
    );
  }

  componentWillUnmount() {
    removeEvent(Event.DATA_UPLOADED, this.downloadAndProcessMailbox);
  }

  incrementPercentage = () => {
    const percent = this.state.percent + 1;
    if (percent === this.state.pauseAt + 1) {
      clearTimeout(this.tm);
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.incrementPercentage, this.state.delay);
  };

  uploadKeys = async () => {
    try {
      const accountData = await signal.uploadKeys();
      if (!accountData) {
        this.linkingDevicesThrowError();
      } else {
        startSocket(accountData.jwt);
        this.setState(
          {
            accountData,
            message: 'Waiting for mailbox',
            pauseAt: 40,
            delay: (40 - this.state.percent) / ANIMATION_DURATION,
            lastStep: STEPS.SEND_KEYS
          },
          () => {
            this.incrementPercentage();
            this.checkDataStatus();
          }
        );
      }
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

  checkDataStatus = async () => {
    if (DATA_STATUS_ATTEMPS === 0) {
      this.setState({
        message: 'Sync taking longer than usual',
        oldDeviceName: 'Would you like to continue waiting?',
        showContinueWaitingButton: true
      });
    } else {
      const { status, body } = await getDataReady();
      switch (status) {
        case DATA_READY_STATUS: {
          const { rowid } = body;
          await acknowledgeEvents([rowid]);
          const {
            dataAddress,
            key,
            authorizerId,
            authorizerType,
            authorizerName
          } = JSON.parse(body.params);
          this.downloadAndProcessMailbox(
            authorizerId,
            dataAddress,
            key,
            authorizerType,
            authorizerName
          );
          return;
        }
        default: {
          this.dataStatusTimeout = await setTimeout(
            this.checkDataStatus,
            DATA_STATUS_DELAY
          );
          DATA_STATUS_ATTEMPS--;
        }
      }
    }
  };

  handleClickKeepWaiting = () => {
    clearTimeout(this.dataStatusTimeout);
    this.setState(
      {
        message: 'Waiting for mailbox',
        oldDeviceName: LINK_DEVICE_EMAIL_ADDRESS,
        showContinueWaitingButton: false
      },
      () => {
        DATA_STATUS_ATTEMPS = DATA_STATUS_RETRIES;
        this.checkDataStatus();
      }
    );
  };

  downloadAndProcessMailbox = (authorizerId, address, key) => {
    clearTimeout(this.dataStatusTimeout);
    this.setState(
      {
        message: 'Downloading mailbox',
        pauseAt: 70,
        delay: (70 - this.state.percent) / ANIMATION_DURATION,
        lastStep: STEPS.WAIT_MAILBOX
      },
      async () => {
        this.incrementPercentage();
        const newAccountData = {
          ...remoteData,
          ...this.state.accountData
        };
        await signal.createAccountToDB(newAccountData);
        await downloadBackupFile(address);

        this.setState(
          {
            message: 'Decrypting mailbox',
            pauseAt: 90,
            delay: (90 - this.state.percent) / ANIMATION_DURATION,
            lastStep: STEPS.DOWNLOAD_MAILBOX
          },
          async () => {
            this.incrementPercentage();
            const { recipientId, deviceId } = remoteData;
            const decryptedKey = await signal.decryptKey({
              text: key,
              recipientId,
              deviceId,
              authorizerId
            });
            await decryptBackupFile(ArrayBufferToBuffer(decryptedKey));
            await importDatabase();

            this.setState(
              {
                message: 'Sync complete',
                pauseAt: 100,
                delay: (100 - this.state.percent) / ANIMATION_DURATION,
                lastStep: STEPS.PROCESS_MAILBOX
              },
              async () => {
                this.incrementPercentage();
                clearSyncData();
                await setTimeout(() => {
                  openMailbox();
                  closeCreatingKeys();
                }, 4000);
              }
            );
          }
        );
      }
    );
  };

  handleClickCancelSync = () => {
    if (this.state.lastStep === STEPS.WAIT_MAILBOX) {
      openMailbox();
      closeCreatingKeys();
    }
  };

  defineRemoteDeviceIcon = () => defineDeviceIcon(remoteData.authorizerType);

  linkingDevicesThrowError = () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true
    });
  };
}

export { LoadingWrapper as default, STEPS };
