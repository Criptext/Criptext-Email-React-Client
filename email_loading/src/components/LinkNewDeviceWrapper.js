import React, { Component } from 'react';
import PropTypes from 'prop-types';
import signal from '../libs/signal';
import {
  remoteData,
  startSocket,
  setPendingRestoreStatus
} from '../utils/electronInterface';
import {
  acknowledgeEvents,
  cleanKeys,
  clearSyncData,
  closeCreatingKeysLoadingWindow,
  decryptBackupFile,
  downloadBackupFile,
  getDataReady,
  importDatabase,
  logoutApp,
  openMailboxWindow,
  openPinWindow,
  throwError,
  swapMailboxAccount,
  logErrorAndReport,
  logLocal
} from './../utils/ipc';
import LinkNewDevice from './LinkNewDevice';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';
import { ArrayBufferToBuffer } from '../utils/BytesUtils';
import { defineDeviceIcon } from '../utils/linkDeviceUtils';
import { appDomain } from '../utils/const';
import string from './../lang';

const messages = string.linkNewDevice.messages;

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
  DECRYPT_KEY: 'decrypting-key',
  PROCESS_MAILBOX: 'processing-mailbox',
  SYNC_COMPLETE: 'sync-complete'
};

const LINK_DEVICE_EMAIL_ADDRESS = remoteData.recipientId
  ? remoteData.recipientId.includes('@')
    ? remoteData.recipientId
    : `${remoteData.recipientId}@${appDomain}`
  : '';

const getRecipientIdFromRemoteData = () => {
  const { recipientId } = remoteData;
  return recipientId.includes(`@${appDomain}`)
    ? recipientId.split('@')[0]
    : recipientId;
};

class LinkNewDeviceWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      percent: 0,
      newAccount: undefined,
      pauseAt: 0,
      delay: 0,
      failed: false,
      lastStep: STEPS.NOT_STARTED,
      oldDeviceName: LINK_DEVICE_EMAIL_ADDRESS,
      showContinueWaitingButton: false
    };

    addEvent(Event.DATA_UPLOADED, this.downloadMailbox);
  }

  componentDidMount() {
    this.setState({ message: messages.sendingKeys, pauseAt: 10 }, async () => {
      this.incrementPercentage();
      await setTimeout(async () => {
        const { name, deviceType } = remoteData;
        await this.generateAccountAndKeys({
          deviceType,
          recipientId: getRecipientIdFromRemoteData(),
          deviceId: 0,
          name
        });
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
    removeEvent(Event.DATA_UPLOADED, this.downloadMailbox);
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

  generateAccountAndKeys = params => {
    this.setState(
      {
        message: messages.sendingKeys,
        pauseAt: 20,
        delay: (20 - this.state.percent) / ANIMATION_DURATION,
        retryData: params,
        lastStep: STEPS.NOT_STARTED
      },
      async () => {
        try {
          logLocal('Link New Device - Create Account and Generating Keys');
          this.incrementPercentage();
          const keybundle = await signal.generateAccountAndKeys(params);
          if (!keybundle) {
            await cleanKeys(getRecipientIdFromRemoteData());
            this.linkingDevicesThrowError();
            return;
          }
          this.uploadKeys(keybundle);
        } catch (e) {
          logErrorAndReport(e.stack);
          this.linkingDevicesThrowError();
        }
      }
    );
  };

  uploadKeys = keybundle => {
    this.setState(
      {
        message: messages.sendingKeys,
        pauseAt: 40,
        delay: (40 - this.state.percent) / ANIMATION_DURATION,
        lastStep: STEPS.NOT_STARTED
      },
      async () => {
        this.incrementPercentage();
        try {
          logLocal('Link New Device - Uploading Keys');
          const accountData = await signal.uploadKeys(keybundle);
          if (!accountData) {
            await cleanKeys(getRecipientIdFromRemoteData());
            logLocal('Link New Device - Unable to Upload Keys');
            this.linkingDevicesThrowError();
            return;
          }
          const newAccountData = {
            ...remoteData,
            ...accountData,
            recipientId: getRecipientIdFromRemoteData(),
            deviceId: remoteData.deviceId,
            customerType: remoteData.customerType || 0,
            addresses: remoteData.addresses
          };
          logLocal('Link New Device - Update Account in DB');
          const response = await signal.createAccountToDB(newAccountData);
          this.setState(
            {
              newAccount: response,
              accountData,
              message: messages.waitingForMailbox
            },
            () => {
              startSocket(accountData.jwt);
              this.checkDataStatus();
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
          return;
        }
      }
    );
  };

  checkDataStatus = async () => {
    if (DATA_STATUS_ATTEMPS === 0) {
      this.setState({
        message: messages.keepWaiting.title,
        oldDeviceName: messages.keepWaiting.message,
        showContinueWaitingButton: true
      });
    } else {
      const { status, body } = await getDataReady(
        getRecipientIdFromRemoteData()
      );
      switch (status) {
        case DATA_READY_STATUS: {
          const { rowid } = body;
          await acknowledgeEvents({
            eventIds: [rowid],
            recipientId: getRecipientIdFromRemoteData()
          });
          const { dataAddress, key, authorizerId } = JSON.parse(body.params);
          this.downloadMailbox(authorizerId, dataAddress, key);
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
        message: messages.waitingForMailbox,
        oldDeviceName: LINK_DEVICE_EMAIL_ADDRESS,
        showContinueWaitingButton: false
      },
      () => {
        DATA_STATUS_ATTEMPS = DATA_STATUS_RETRIES;
        this.checkDataStatus();
      }
    );
  };

  downloadMailbox = (authorizerId, address, key) => {
    clearTimeout(this.dataStatusTimeout);
    this.setState(
      {
        message: messages.downloadingMailbox,
        pauseAt: 70,
        delay: (70 - this.state.percent) / ANIMATION_DURATION,
        lastStep: STEPS.SEND_KEYS,
        retryData: { authorizerId, address, key }
      },
      async () => {
        logLocal('Link New Device - Downloading Mailbox');
        this.incrementPercentage();
        const response = await downloadBackupFile(address);
        if (response.statusCode !== 200) {
          this.linkingDevicesThrowError();
          return;
        }
        this.decryptKey(authorizerId, key);
      }
    );
  };

  decryptKey = (authorizerId, key) => {
    this.setState(
      {
        message: messages.decryptingMailbox,
        pauseAt: 80,
        delay: (80 - this.state.percent) / ANIMATION_DURATION,
        lastStep: STEPS.DOWNLOAD_MAILBOX,
        retryData: { authorizerId, key }
      },
      async () => {
        logLocal('Link New Device - Decrypting Signal Key');
        this.incrementPercentage();
        const MESSAGE_PRE_KEY = 3;
        try {
          const decryptedKey = await signal.decryptKey({
            text: key,
            recipientId: getRecipientIdFromRemoteData(),
            deviceId: authorizerId,
            messageType: MESSAGE_PRE_KEY
          });
          this.processMailbox(authorizerId, decryptedKey);
        } catch (ex) {
          logErrorAndReport(ex.stack);
          this.linkingDevicesThrowError();
        }
      }
    );
  };

  processMailbox = (authorizerId, decryptedKey) => {
    this.setState(
      {
        message: messages.decryptingMailbox,
        pauseAt: 90,
        delay: (90 - this.state.percent) / ANIMATION_DURATION,
        lastStep: STEPS.DECRYPT_KEY,
        retryData: { authorizerId, decryptedKey }
      },
      async () => {
        this.incrementPercentage();
        logLocal('Link New Device - Decrypting Key');
        await decryptBackupFile(ArrayBufferToBuffer(decryptedKey));
        logLocal('Link New Device - Importing Database');
        await importDatabase({
          withoutBodiesEncryption: this.props.shouldResetPIN,
          accountObj: this.state.newAccount
        })
          .then(() => {
            this.setState(
              {
                message: messages.syncComplete,
                pauseAt: 100,
                delay: (100 - this.state.percent) / ANIMATION_DURATION,
                lastStep: STEPS.PROCESS_MAILBOX
              },
              async () => {
                this.incrementPercentage();
                clearSyncData();
                await setTimeout(() => {
                  this.nextWindow();
                }, 4000);
              }
            );
          })
          .catch(e => {
            logErrorAndReport(e.stack);
            this.linkingDevicesThrowError();
          });
      }
    );
  };

  handleClickCancelSync = () => {
    switch (this.state.lastStep) {
      case STEPS.DOWNLOAD_MAILBOX:
      case STEPS.DECRYPT_KEY:
        setPendingRestoreStatus(true);
        this.nextWindow();
        break;
      default: {
        cleanKeys(getRecipientIdFromRemoteData());
        closeCreatingKeysLoadingWindow();
        logoutApp();
        break;
      }
    }
  };

  defineRemoteDeviceIcon = () => defineDeviceIcon(remoteData.authorizerType);

  linkingDevicesThrowError = () => {
    clearTimeout(this.tm);

    const step = this.state.lastStep;
    const progressRollback = {};
    switch (step) {
      case STEPS.DOWNLOAD_MAILBOX: {
        progressRollback.percent = 70;
        progressRollback.delay = (this.state.percent - 70) / ANIMATION_DURATION;
        break;
      }
      case STEPS.DECRYPT_KEY: {
        progressRollback.percent = 80;
        progressRollback.delay = (this.state.percent - 80) / ANIMATION_DURATION;
        break;
      }
      case STEPS.SEND_KEYS: {
        progressRollback.percent = 40;
        progressRollback.delay = (this.state.percent - 40) / ANIMATION_DURATION;
        break;
      }
      case STEPS.NOT_STARTED: {
        progressRollback.percent = 10;
        progressRollback.delay = (this.state.percent - 10) / ANIMATION_DURATION;
        break;
      }
      default: {
        break;
      }
    }
    this.setState({
      ...progressRollback,
      failed: true
    });
  };

  handleClickRetry = () => {
    const step = this.state.lastStep;
    const retryData = { ...this.state.retryData };
    switch (step) {
      case STEPS.DOWNLOAD_MAILBOX: {
        this.setState(
          {
            failed: false
          },
          () => {
            this.decryptKey(retryData.authorizerId, retryData.key);
          }
        );
        return;
      }
      case STEPS.DECRYPT_KEY: {
        this.setState(
          {
            failed: false
          },
          () => {
            this.processMailbox(retryData.authorizerId, retryData.decryptKey);
          }
        );
        return;
      }
      case STEPS.SEND_KEYS: {
        this.setState(
          {
            failed: false
          },
          () => {
            this.downloadMailbox(
              retryData.authorizerId,
              retryData.address,
              retryData.key
            );
          }
        );
        return;
      }
      case STEPS.NOT_STARTED: {
        this.setState(
          {
            failed: false
          },
          () => {
            this.generateAccountAndKeys(retryData);
          }
        );
        return;
      }
      default: {
        return;
      }
    }
  };

  nextWindow = () => {
    if (this.state.newAccount) {
      swapMailboxAccount(this.state.newAccount);
    } else if (this.props.shouldResetPIN) {
      openPinWindow({ pinType: 'signin' });
    } else {
      openMailboxWindow();
    }
    closeCreatingKeysLoadingWindow();
  };
}

LinkNewDeviceWrapper.propTypes = {
  shouldResetPIN: PropTypes.bool
};

export { LinkNewDeviceWrapper as default, STEPS };
