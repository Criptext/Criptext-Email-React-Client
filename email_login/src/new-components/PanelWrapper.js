import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Launch from './Launch';
import SignUpWrapper from './signup/SignUpWrapper';
import SetupWrapper from './setup/SetupWrapper';
import PinWrapper from './pin/PinWrapper';

export const MODE = {
  LAUNCH: 'launch',
  SIGNUP: 'sign-up',
  LOGIN: 'login',
  SETUP: 'setup',
  PIN: 'pin'
};

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      mode: MODE.LAUNCH,
      storeData: {}
    };
  }

  render() {
    switch (this.state.mode) {
      case MODE.PIN:
        return (
          <PinWrapper
            onParentGoBack={this.handleGoBack}
            onGoTo={this.handleGoTo}
          />
        );
      case MODE.SIGNUP:
        return (
          <SignUpWrapper
            storeData={this.storeData}
            onParentGoBack={this.handleGoBack}
            onGoTo={this.handleGoTo}
          />
        );
      case MODE.SETUP:
        return (
          <SetupWrapper
            onParentGoBack={this.handleGoBack}
            account={this.state.storeData}
          />
        );
      default:
        return (
          <Launch
            onGoTo={this.handleGoTo}
            onChangeVersion={this.props.onChangeVersion}
          />
        );
    }
  }

  handleGoTo = (mode, storeData = {}) => {
    const queue = [...this.state.queue];
    queue.push(this.state.mode);
    this.setState({
      queue,
      mode,
      storeData: {
        ...this.state.storeData,
        ...storeData
      }
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];
    const mode = queue.pop();
    this.setState({
      queue,
      mode
    });
  };
}

PanelWrapper.propTypes = {
  mode: PropTypes.string,
  onChangeVersion: PropTypes.func
};
export default PanelWrapper;
