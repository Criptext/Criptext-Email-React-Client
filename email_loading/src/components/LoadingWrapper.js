import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import signal from './../libs/signal';
import { remoteData } from './../utils/electronInterface';
import {
  closeCreatingKeysLoadingWindow,
  openMailboxWindow,
  throwError
} from './../utils/ipc';
import string from './../lang';
import { appDomain } from '../utils/const';

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

const loadingTypes = {
  SIGNUP: 'signup',
  LOGIN: 'login'
};

const delay = 85;
const responseMaxDelay = 300;
const lastMessageDelay = 2000;

class LoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      failed: false,
      animationClass: animationTypes.RUNNING,
      timeout: 0,
      accountResponse: undefined
    };
  }

  componentDidMount() {
    this.increasePercent();
  }

  render() {
    return (
      <Loading
        animationClass={this.state.animationClass}
        percent={this.state.percent}
        failed={this.state.failed}
        restart={this.restart}
      />
    );
  }

  increasePercent = () => {
    const percent = this.state.percent + 1;
    if (percent === 2) {
      if (this.props.loadingType === loadingTypes.SIGNUP) {
        this.createNewAccount();
      } else if (this.props.loadingType === loadingTypes.LOGIN) {
        const { recipientId, deviceId, name, deviceType } = remoteData;
        let isRecipientApp = false;
        let username = recipientId;
        if (recipientId.includes(`@${appDomain}`)) {
          isRecipientApp = true;
          [username] = recipientId.split('@');
        }
        this.createAccountWithNewDevice({
          recipientId: username,
          deviceId,
          name,
          deviceType,
          isRecipientApp
        });
      }
    }
    if (percent > 99) {
      clearTimeout(this.tm);
      this.checkResult();
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.increasePercent, delay);
  };

  createNewAccount = async () => {
    const userCredentials = {
      recipientId: remoteData.username,
      password: remoteData.password,
      name: remoteData.name,
      deviceType: remoteData.deviceType
    };
    if (remoteData.recoveryEmail !== '') {
      userCredentials['recoveryEmail'] = remoteData.recoveryEmail;
    }
    try {
      const accountId = await signal.createAccount(userCredentials);
      if (accountId) {
        this.accountId = accountId;
        this.setState({
          accountResponse: true,
          failed: false
        });
      }
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        throwError(string.errors.unableToConnect);
      } else {
        throwError({
          name: e.name,
          description: e.description || e.message
        });
      }
      this.loadingThrowError();
      return;
    }
  };

  createAccountWithNewDevice = async ({
    recipientId,
    deviceId,
    name,
    deviceType,
    isRecipientApp
  }) => {
    try {
      const loginResponse = await signal.createAccountWithNewDevice({
        recipientId,
        deviceId,
        name,
        deviceType,
        isRecipientApp
      });
      if (loginResponse === false) {
        this.loadingThrowError();
      }
      if (loginResponse === true) {
        this.setState({
          accountResponse: loginResponse,
          failed: false
        });
      }
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        throwError(string.errors.unableToConnect);
      } else {
        throwError({
          name: e.name,
          description: e.description || e.message
        });
      }
      this.loadingThrowError();
    }
  };

  checkResult = () => {
    if (
      this.state.timeout > responseMaxDelay &&
      this.state.accountResponse === undefined
    ) {
      clearTimeout(this.state.timeout);
      throwError(string.errors.noResponse);
      this.loadingThrowError();
      return;
    }
    if (this.state.accountResponse === false) {
      clearTimeout(this.state.timeout);
      this.loadingThrowError();
    }
    if (this.state.accountResponse === true) {
      clearTimeout(this.state.timeout);
      this.setState({ percent: 99 }, () => {
        const accountId = this.accountId;
        const recipientId = remoteData.recipientId || remoteData.username;
        this.checkMailboxWindowIsReady({ accountId, recipientId });
      });
    }
    this.setState({
      timeout: setTimeout(this.checkResult, 1000)
    });
  };

  checkMailboxWindowIsReady = ({ accountId, recipientId }) => {
    const isGettingEvents = getMailboxGettingEventsStatus();
    if (isGettingEvents === false) {
      clearTimeout(this.mailboxIsReadyTimeout);
      this.setState(
        {
          percent: 100,
          message: messages.mailboxIsReady
        },
        async () => {
          await setTimeout(() => {
            disableEventRequests();
            openMailboxWindow({ accountId, recipientId });
            closeCreatingKeysLoadingWindow();
          }, lastMessageDelay);
        }
      );
    } else {
      this.setState(
        {
          message: messages.waitingMailboxIsReady
        },
        () => {
          this.mailboxIsReadyTimeout = setTimeout(() => {
            this.checkMailboxWindowIsReady({ accountId, recipientId });
          }, lastMessageDelay);
        }
      );
    }
  };

  loadingThrowError = async () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true,
      animationClass: animationTypes.STOP
    });
    await setTimeout(() => {
      this.setState({
        percent: 0
      });
    }, 1000);
  };

  restart = () => {
    clearTimeout(this.tm);
    this.setState(
      {
        percent: 0,
        animationClass: animationTypes.RUNNING,
        failed: false
      },
      () => {
        this.increasePercent();
      }
    );
  };
}

LoadingWrapper.propTypes = {
  loadingType: PropTypes.string
};

export default LoadingWrapper;
