import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Launch from './Launch';
import SignUpWrapper from './signup/SignUpWrapper';

export const MODE = {
  LAUNCH: 'launch',
  SIGNUP: 'sign-up',
  LOGIN: 'login',
  PIN: 'pin'
};

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      mode: props.mode ? props.MODE : MODE.LAUNCH
    };
  }

  render() {
    switch (this.state.mode) {
      case MODE.PIN:
        return <div>TODO</div>;
      case MODE.SIGNUP:
        return <SignUpWrapper onParentGoBack={this.handleGoBack} />;
      default:
        return <Launch onGoTo={this.handleGoTo} />;
    }
  }

  handleGoTo = mode => {
    const queue = [...this.state.queue];
    queue.push(this.state.mode);
    this.setState({
      queue,
      mode
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
  mode: PropTypes.string
};
export default PanelWrapper;
