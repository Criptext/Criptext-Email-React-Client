import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';

const statusType = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation',
  COMPLETE: 'complete-animation'
};

const delay = 85;
// const responseMaxDelay = 300;

class MxLoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      timeout: 0,
      failed: false,
      errorType: 0,
      animationClass: statusType.RUNNING
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
        errorType={this.state.errorType}
        restart={this.restart}
        onClickMinusStep={this.props.onClickMinusStep}
      />
    );
  }

  increasePercent = () => {
    const percent = this.state.percent + 1;
    if (percent > 99) {
      clearTimeout(this.tm);
      return;
    }
    this.setState({ percent });
    this.tm = setTimeout(this.increasePercent, delay);
  };

  loadingThrowError = async () => {
    clearTimeout(this.tm);
    this.setState({
      failed: true,
      animationClass: statusType.STOP
    });
    await setTimeout(() => {
      this.setState({ percent: 0 });
    }, 1000);
  };

  restart = () => {
    clearTimeout(this.tm);
    this.setState(
      {
        percent: 0,
        animationClass: statusType.RUNNING,
        failed: false
      },
      () => {
        this.increasePercent();
      }
    );
  };
}

export default MxLoadingWrapper;
