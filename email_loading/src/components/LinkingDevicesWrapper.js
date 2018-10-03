import React, { Component } from 'react';
import signal from './../libs/signal';
import {
  closeCreatingKeys,
  openMailbox,
  remoteData,
  downloadBackupFile,
  startSocket,
  decryptBackupFile,
  importDatabase
} from './../utils/electronInterface';
import LinkingDevices from './LinkingDevices';
import { addEvent, Event } from '../utils/electronEventInterface';
import { ArrayBufferToBuffer } from '../utils/BytesUtils';

class LoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false,
      message: '',
      newAccountData: undefined
    };

    addEvent(Event.DATA_UPLOADED, (address, key) => {
      this.setMessage('Downloading backup', async () => {
        const fakeDeviceId = 37;
        const newAccountData = {
          ...remoteData,
          ...this.state.accountData,
          deviceId: fakeDeviceId
        };
        await signal.createAccountToDB(newAccountData);
        await downloadBackupFile(address);
        this.setMessage('Decrypting', async () => {
          const { recipientId, deviceId } = remoteData;
          const decryptedKey = await signal.decryptKey({
            text: key,
            recipientId,
            deviceId
          });
          await decryptBackupFile(ArrayBufferToBuffer(decryptedKey));
          this.setMessage('Importing your data', async () => {
            await importDatabase();
            this.setMessage('Opening your mailbox');
            openMailbox();
            closeCreatingKeys();
          });
        });
      });
    });
  }

  componentDidMount() {
    this.setMessage('Establishing secure connection', async () => {
      await this.uploadKeys();
    });
  }

  render() {
    return (
      <LinkingDevices
        message={this.state.message}
        failed={this.state.failed}
        restart={this.restart}
      />
    );
  }

  uploadKeys = async () => {
    try {
      const accountData = await signal.uploadKeys();
      if (!accountData) {
        this.linkingDevicesThrowError();
      } else {
        startSocket(accountData.jwt);
        this.setState({ accountData });
        this.setMessage('Secure connection established');
      }
    } catch (e) {
      this.linkingDevicesThrowError();
    }
  };

  setMessage = (message, callback) => {
    this.setState({ message }, callback);
  };

  linkingDevicesThrowError = () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true
    });
  };

  restart = () => {
    clearTimeout(this.tm);
    this.setState(
      {
        failed: false
      },
      () => {
        // this.increasePercent();
      }
    );
  };
}

export default LoadingWrapper;
