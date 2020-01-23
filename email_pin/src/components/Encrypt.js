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
      percent: 0,
      stepTitle: 1
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
          <h1>{page_encrypt.steps[this.state.stepTitle]}</h1>
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
          <span>{page_encrypt.paragraph}</span>
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
          let stepTitle = state.stepTitle;
          if (
            (current >= 2 && current <= 6 && state.stepTitle === 1) ||
            (current > 6 && state.stepTitle === 2)
          )
            stepTitle++;
          return { percent: state.percent + 1, stepTitle };
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
