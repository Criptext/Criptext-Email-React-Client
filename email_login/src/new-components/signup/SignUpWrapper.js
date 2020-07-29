import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignUpFormWrapper from './SignUpFormWrapper';
import SignUpCreateAccountWrapper from './SignUpCreateAccountWrapper';

export const MODE = {
  FORM: 'form',
  CREATE: 'create'
};

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      mode: props.mode ? props.MODE : MODE.FORM,
      signupData: {}
    };
  }

  render() {
    switch (this.state.mode) {
      case MODE.CREATE:
        return <SignUpCreateAccountWrapper signupData={this.state.signupData} onGoBack={this.handleGoBack} />;
      default:
        return (
          <SignUpFormWrapper
            signupData={this.state.signupData}
            onGoTo={this.handleGoTo}
            onGoBack={this.handleGoBack}
          />
        );
    }
  }

  handleGoTo = (mode, storeData) => {
    const queue = [...this.state.queue];
    queue.push(this.state.mode);
    this.setState({
      queue,
      mode,
      signupData: {
        ...this.state.signupData,
        ...storeData
      }
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];

    if (queue.length <= 0) {
      this.props.onParentGoBack();
      return;
    }

    const mode = queue.pop();
    this.setState({
      queue,
      mode
    });
  };
}

export default SignUpWrapper;
