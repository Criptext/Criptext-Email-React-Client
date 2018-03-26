import React, { Component } from 'react';
import signal from './../libs/signal';
import {
  closeCreatingKeys,
  openMailbox,
  remoteData
} from './../utils/electronInterface';
import Loading from './Loading';

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

class LoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      errors: 1,
      failed: false,
      animationClass: animationTypes.RUNNING
    };
    this.increasePercent = this.increasePercent.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.throwError = this.throwError.bind(this);
    this.restart = this.restart.bind(this);
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

  increasePercent() {
    const percent = this.state.percent + 1;
    if (percent === 1) {
      this.createAccount();
    }
    if (percent > 100 && this.state.failed === false) {
      clearTimeout(this.tm);
      openMailbox();
      closeCreatingKeys();
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.increasePercent, 150);
  }

  async createAccount() {
    try {
      const userCredentials = {
        recipientId: remoteData.username,
        password: remoteData.password,
        name: remoteData.name
      };
      if (remoteData.recoveryEmail !== '') {
        userCredentials['recoveryEmail'] = remoteData.recoveryEmail;
      }
      const accountResponse = await signal.createAccount(userCredentials);
      if (accountResponse === false) {
        this.throwError();
      } else {
        this.setState({
          failed: false,
          errors: 0
        });
      }
    } catch (e) {
      this.throwError();
    }
  }

  async throwError() {
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
  }

  restart() {
    clearTimeout(this.tm);
    const prevErrors = this.state.errors;
    this.setState(
      {
        percent: 0,
        animationClass: animationTypes.RUNNING,
        failed: false,
        errors: prevErrors - 1
      },
      () => {
        this.increasePercent();
      }
    );
  }
}

export default LoadingWrapper;
