import React, { Component } from 'react';
import string from './../lang';
import './encrypt.scss';

const { page_encrypt } = string;

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

class Encrypt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animationState: animationTypes.RUNNING,
      percent: 100
    };
    this.textArea = undefined;
  }

  render() {
    return (
      <section>
        <div className="encrypt-content">
          <div className="encrypt-icon" />
          <h1>{page_encrypt.title}</h1>
          <div className="encrypt-loading">
            <div className="bar">
              <div
                className={`content ${this.state.animationState}`}
                style={{ width: this.state.percent + '%' }}
              />
            </div>
            <div className="percent">
              <div className="content">
                <span className="number">{this.state.percent}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Encrypt;
