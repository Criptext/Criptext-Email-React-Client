import React, { Component } from 'react';
import { getProgressDBE } from './../utils/electronInterface';
import string from './../lang';
import './encrypt.scss';

const { page_encrypt } = string;
const delay = 1000;

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

class Encrypt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animationState: animationTypes.RUNNING,
      percent: 0
    };
    this.textArea = undefined;
    const { total } = getProgressDBE();
    this.total = total;
    this.current = 0;
    this.next = 0;
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
          <span>This may take a while, does not close the window</span>
        </div>
      </section>
    );
  }

  componentDidMount() {
    this.increasePercent();
  }

  increasePercent = () => {
    const { current } = getProgressDBE();
    if (current !== this.current) {
      this.current = current;
      this.next = this.current * 100 / this.total;
      if (this.next > this.state.percent) {
        this.setState(state => {
          return { percent: state.percent + 1 };
        });
      }
    } else if (this.next > this.state.percent) {
      this.setState(state => {
        return { percent: state.percent + 1 };
      });
    } else if (current >= this.total) {
      clearTimeout(this.tm);
      return;
    }
    this.tm = setTimeout(this.increasePercent, delay);
  };
}

export default Encrypt;
