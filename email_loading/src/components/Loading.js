import React, { Component } from 'react';
import {
  closeCreatingKeys,
  createSession,
  openMailbox,
  remoteData
} from './../utils/electronInterface';
import signal from './../libs/signal';
import './loading.css';

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

class Loading extends Component {
  constructor() {
    super();
    this.state = {
      percent: 0,
      errors: 1,
      failed: false,
      animationClass: animationTypes.RUNNING
    };
    this.remderMessage = this.remderMessage.bind(this);
    this.increasePercent = this.increasePercent.bind(this);
    this.throwError = this.throwError.bind(this);
    this.restart = this.restart.bind(this);
  }

  componentDidMount() {
    this.increasePercent();
  }

  render() {
    return (
      <div className="loading-body">
        <div className="content">
          <div className="logo">
            <div className="icon" />
          </div>
          <div className="bar">
            <div className={'content ' + this.state.animationClass} />
          </div>
          <div className="percent">
            <div className="content">
              <span className="number">{this.state.percent}%</span>
            </div>
          </div>
          <div className="message">{this.remderMessage()}</div>
        </div>
      </div>
    );
  }

  remderMessage() {
    if (this.state.failed === true) {
      return (
        <div className="retry">
          <span>Error generating the keys. </span>
          <span className="retry-link" onClick={this.restart}>
            Retry
          </span>?
        </div>
      );
    }
    return <span className="creating"> Creating Keys </span>;
  }

  increasePercent() {
    const percent = this.state.percent + 1;
    if (percent === 51 && this.state.errors > 0) {
      clearTimeout(this.tm);
      this.throwError();
      return;
    }
    if (percent === 70) {
      this.createKeys();
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

  async createKeys() {
    try {
      await signal.createStore();
      const userCredentials = {
        recipientId: remoteData.username,
        password: remoteData.password,
        name: remoteData.name
      };
      if (remoteData.recoveryEmail !== '') {
        userCredentials['recoveryEmail'] = remoteData.recoveryEmail;
      }
      const createResponse = await signal.createUser(userCredentials);
      const sessionCredentials = {
        username: remoteData.username,
        name: remoteData.name,
        keyserverToken: createResponse
      };
      await createSession(sessionCredentials);
      this.setState({
        failed: false,
        errors: 0
      });
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

export default Loading;
