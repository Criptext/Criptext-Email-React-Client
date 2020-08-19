import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignUpFormWrapper from './SignUpFormWrapper';
import AccountReady from './AccountReady';
import AccountCreated from './AccountCreated';
import SignUpCreateAccountWrapper from './SignUpCreateAccountWrapper';

export const MODE = {
  FORM: 'form',
  CREATE: 'create',
  CREATED: 'created',
  READY: 'ready'
};

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      mode: props.mode ? props.MODE : MODE.FORM,
      states: [],
      previousState: null,
      signupData: {}
    };
  }

  render() {
    switch (this.state.mode) {
      case MODE.CREATE:
        return (
          <SignUpCreateAccountWrapper
            signupData={this.state.signupData}
            onGoBack={this.handleGoBack}
            onGoTo={this.handleGoTo}
            previousState={this.state.previousState}
          />
        );
      case MODE.READY:
        return (
          <AccountReady
            email={this.state.signupData.email}
            name={this.state.signupData.fullname}
            onNextHandle={this.handleNext}
            previousState={this.state.previousState}
          />
        );
      case MODE.CREATED:
        return (
          <AccountCreated
            onNextHandle={this.handleNext}
            previousState={this.state.previousState}
          />
        );
      default:
        return (
          <SignUpFormWrapper
            signupData={this.state.signupData}
            onGoTo={this.handleGoTo}
            onGoBack={this.handleGoBack}
            previousState={this.state.previousState}
          />
        );
    }
  }

  handleGoTo = (mode, storeData = {}, stateData) => {
    const queue = [...this.state.queue];
    queue.push(this.state.mode);
    const states = [...this.state.states];
    states.push(stateData);
    this.setState({
      queue,
      mode,
      states,
      signupData: {
        ...this.state.signupData,
        ...storeData
      }
    });
  };

  handleNext = section => {
    this.props.onGoTo(section, {
      ...this.state.signupData
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];

    if (queue.length <= 0) {
      this.props.onParentGoBack();
      return;
    }

    const states = [...this.state.states];

    const previousState = states.pop();
    const mode = queue.pop();
    this.setState({
      queue,
      mode,
      previousState,
      states
    });
  };
}

export default SignUpWrapper;
