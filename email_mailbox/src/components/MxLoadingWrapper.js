import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import { validateDomainMX } from '../utils/ipc';

const statusType = {
  RUNNING: 'running-animation',
  STOP: 'stop-animation',
  COMPLETE: 'complete-animation'
};

const errorType = {
  MX_NOT_MATCH: 1,
  OTHER: 2
};

const delay = 180;
const delayError = 25;
const delaySuccess = 35;

class MxLoadingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      timeout: 0,
      failed: false,
      errorType: 0,
      animationClass: statusType.RUNNING,
      minutes: 4
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
        decreaseStep={this.decreaseStep}
        minutes={this.state.minutes}
        domain={this.props.domain}
      />
    );
  }

  increasePercent = () => {
    const percent = this.state.percent + 1;
    if (percent === 1 || percent === 33 || percent === 66 || percent === 99) {
      const domain = this.props.domain;
      const response =
        percent === 33 ? { status: 200 } : validateDomainMX(domain);
      const newMinutes = this.state.minutes - 1;

      this.setState({
        minutes: newMinutes
      });

      if (response && response.status === 200) {
        this.setState({
          animationClass: statusType.COMPLETE
        });
        clearTimeout(this.tm);
        this.tm = setTimeout(this.increasePercentSuccesfull, delaySuccess);
      } else if (percent === 99) {
        const errorState =
          response && response.status !== 400
            ? errorType.MX_NOT_MATCH
            : errorType.OTHER;
        this.setState({
          failed: true,
          animationClass: statusType.STOP,
          errorType: errorState
        });
        clearTimeout(this.tm);
        this.tm = setTimeout(this.decreasePercentError, delayError);
      } else {
        this.setState({ percent });
        this.tm = setTimeout(this.increasePercent, delay);
      }
    } else {
      this.setState({ percent });
      this.tm = setTimeout(this.increasePercent, delay);
    }
  };

  decreasePercentError = () => {
    const percent = this.state.percent - 1;
    this.setState({ percent });
    if (percent === 20) {
      clearTimeout(this.tm);
    } else {
      this.tm = setTimeout(this.decreasePercentError, delayError);
    }
  };

  increasePercentSuccesfull = () => {
    const percent = this.state.percent + 1;
    this.setState({ percent });
    if (percent === 100) {
      clearTimeout(this.tm);
      setTimeout(
        () => this.props.onClickChangeStep(this.props.currentStep + 1),
        2000
      );
    } else {
      this.tm = setTimeout(this.increasePercentSuccesfull, delaySuccess);
    }
  };

  decreaseStep = () => {
    const step = this.props.currentStep;
    this.props.onClickChangeStep(step - 1);
  };

  restart = () => {
    clearTimeout(this.tm);
    this.setState({
      percent: 0,
      animationClass: statusType.RUNNING,
      failed: false
    });
  };
}

MxLoadingWrapper.propTypes = {
  domain: PropTypes.string,
  currentStep: PropTypes.number,
  onClickChangeStep: PropTypes.func
};

export default MxLoadingWrapper;
