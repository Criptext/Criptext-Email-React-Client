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
    const { total, current } = getProgressDBE();
    this.total = total;
    this.current = current;
    this.next = current * 100 / total;
    this.delay = 100;
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
    if (this.state.percent < this.next) {
      this.setState(state => {
        let percent = state.percent + 1;
        if (percent >= 100) {
          percent = 100;
          this.next = 100;
        }
        return { percent };
      });
      this.delay = 100;
    } else if (this.current < this.total) {
      const { current } = getProgressDBE();
      if (this.current !== current) {
        this.current = current;
        this.next = current * 100 / this.total;
        this.setState(state => {
          let stepTitle = state.stepTitle;
          if (
            (current === 3 && state.stepTitle === 1) ||
            (current === 4 && state.stepTitle < 3)
          )
            stepTitle++;
          return { stepTitle };
        });
      }
      this.delay = 3000;
    } else if (this.current >= this.total) {
      clearTimeout(this.tm);
      return;
    }
    this.tm = setTimeout(this.increasePercent, this.delay);
  };
}

export default EncryptWrapper;
