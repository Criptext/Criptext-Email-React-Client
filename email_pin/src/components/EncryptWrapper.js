import React, { Component } from 'react';
import Encrypt from './Encrypt';
import { getProgressDBE } from './../utils/electronInterface';
import string from './../lang';

const { page_encrypt } = string;

const animationTypes = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation'
};

class EncryptWrapper extends Component {
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
    this.delay = 1000;
  }

  render() {
    return (
      <Encrypt
        title={page_encrypt.steps[this.state.stepTitle]}
        animationState={this.state.animationState || animationTypes.RUNNING}
        percent={this.state.percent}
        paragraph={page_encrypt.paragraph}
      />
    );
  }

  componentDidMount() {
    this.increasePercent();
  }

  increasePercent = () => {
    const { current } = getProgressDBE();
    if (current !== this.current) {
      if (current >= 6 && this.delay === 1000) this.delay = this.delay * 2;
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
    this.tm = setTimeout(this.increasePercent, this.delay);
  };
}

export default EncryptWrapper;
