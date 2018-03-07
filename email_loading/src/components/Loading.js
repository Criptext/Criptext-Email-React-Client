import React, { Component } from 'react';
import ClientAPI from '@criptext/email-http-client';
import {
  closeCreatingKeys,
  openMailbox,
  remoteData
} from './../utils/electronInterface';
import { createStore, generatePreKeyBundle } from './../libs/signal-criptext';
import { API_URL } from './../utils/const';
import './loading.css';

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
}

class Loading extends Component {
  constructor (){
    super();
    this.state = {
      percent: 1, 
      errors: 1,
      failed: false,
      animationClass: animationTypes.RUNNING
    }
    this.remderMessage = this.remderMessage.bind(this);
    this.increasePercent = this.increasePercent.bind(this);
    this.throwError = this.throwError.bind(this);
    this.restart = this.restart.bind(this);
  }

  componentDidMount() {
    this.increasePercent();
  }

  render () {
    return (
      <div className="loading-body">
        <div className="content">
          <div className="logo">
            <div className="icon" />
          </div>
  
          <div className="bar">
            <div className={"content " + this.state.animationClass} />
          </div>
  
          <div className="percent">
            <div className="content">
              <span className="number">{this.state.percent}%</span>
            </div>
          </div>
          <div className="message">
            {this.remderMessage()}
          </div>
        </div>
      </div>
    );
  }

  remderMessage () {
    if (this.state.failed === true) {
      return <span className="retry" onClick={this.restart}> Retry </span>  
    }
    return <span className="creating"> Creating Keys </span>;
  }

  increasePercent () {
    const percent = this.state.percent + 1;
    if (percent === 70) {
      this.createKeys();
    }
    if ( percent === 50 && this.state.errors > 0 ) {
      clearTimeout(this.tm);
      this.throwError();
      return;
    }
    if (percent > 100) {
      clearTimeout(this.tm);
      openMailbox();
      closeCreatingKeys();
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.increasePercent, 150);
  }

  async createKeys () {
    const client = new ClientAPI(API_URL);
    const store = await createStore();
    const bundle = await generatePreKeyBundle(store, 1, 1);
    const credentials = {
      username: remoteData.username,
      password: remoteData.password,
      deviceId: 1
    };
    const loginResponse = await client.login(credentials);
    if (loginResponse.status === 200) {
      const serverResponse = await client.postKeyBundle(bundle);
      if (serverResponse.status === 200) {
        this.setState({ 
          failed: false,
          errors: 0
        });
      }
      else {
        this.throwError();
      }
    }
    else {
      this.throwError();
    }
  }

  async throwError () {
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
    this.setState({ 
      percent: 0, 
      animationClass: animationTypes.RUNNING,
      failed: false,
      errors: prevErrors-1
    }, () => {
      this.increasePercent();
    });
  }

}

export default Loading;
