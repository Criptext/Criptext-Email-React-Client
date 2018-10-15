import React, { Component } from 'react';
import signal from '../libs/signal';
import {
  closeCreatingKeys,
  openMailbox,
  remoteData,
  downloadBackupFile,
  startSocket,
  decryptBackupFile,
  importDatabase,
  clearSyncData
} from '../utils/electronInterface';
import LinkNewDevice from './LinkNewDevice';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';
import { ArrayBufferToBuffer } from '../utils/BytesUtils';
import { appDomain } from '../utils/const';

const ANIMATION_DURATION = 1500;

const STEPS = {
  NOT_STARTED: 'not-started',
  SEND_KEYS: 'send-keys',
  WAIT_MAILBOX: 'waiting-for-mailbox',
  DOWNLOAD_MAILBOX: 'downloading-mailbox',
  PROCESS_MAILBOX: 'processing-mailbox',
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
      oldDeviceName: `${remoteData.recipientId}@${appDomain}`
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
          }
        );
      }
    } catch (e) {
      this.linkingDevicesThrowError();
    }
  };

  downloadAndProcessMailbox = (authorizerId, address, key) => {
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

  linkingDevicesThrowError = () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true
    });
  };
}

export { LoadingWrapper as default, STEPS };
