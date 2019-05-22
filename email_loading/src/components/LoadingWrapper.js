import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import signal from './../libs/signal';
import {
  remoteData,
  getMailboxGettingEventsStatus,
  disableEventRequests
} from './../utils/electronInterface';
import {
  closeCreatingKeysLoadingWindow,
  openMailboxWindow,
  throwError
} from './../utils/ipc';
import string from './../lang';

const messages = string.loading.messages;

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

class LoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      failed: false,
      message: '',
      retryMessage: '',
      animationClass: animationTypes.RUNNING,
      timeout: 0,
      accountResponse: undefined
    };
    this.accountId = undefined;
  }

  componentDidMount() {
    this.setState({ message: messages.creatingKeys });
    this.increasePercent();
  }

  render() {
    return (
      <Loading
        message={this.state.message}
        retryMessage={this.state.retryMessage}
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
        this.createAccountWithNewDevice({
          recipientId,
          deviceId,
          name,
          deviceType
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
      const accountResponse = await signal.createAccount(userCredentials);
      if (accountResponse === false) {
        this.loadingThrowError();
      }
      if (accountResponse === true) {
        this.setState({
          accountResponse,
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
    deviceType
  }) => {
    try {
      const { accountId } = await signal.createAccountWithNewDevice({
        recipientId,
        deviceId,
        name,
        deviceType
      });
      if (!accountId) {
        this.loadingThrowError();
      }
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
        const recipientId = remoteData.recipientId;
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
          }, 2500);
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
          }, 2000);
        }
      );
    }
  };

  loadingThrowError = async () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true,
      message: messages.error,
      retryMessage: messages.retry,
      animationClass: animationTypes.STOP
    });
    await setTimeout(() => {
      this.setState({ percent: 0 });
    }, 1000);
  };

  restart = () => {
    clearTimeout(this.tm);
    this.setState(
      {
        failed: false,
        percent: 0,
        message: messages.creatingKeys,
        retryMessage: '',
        animationClass: animationTypes.RUNNING
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
