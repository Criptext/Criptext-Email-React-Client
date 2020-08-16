import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PinStart from './PinStart';
import PinDisplay from './PinDisplay';
import PinSetWrapper from './PinSetWrapper';

export const STEP = {
  START: 'start',
  PIN: 'pin',
  SET: 'set',
  SAVE: 'save',
  DONE: 'done'
};

class PinWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      step: STEP.SET
    };
  }

  render() {
    let Component;
    switch (this.state.step) {
      case STEP.START:
        Component = PinStart;
        break;
      case STEP.PIN:
        Component = PinDisplay;
        break;
      case STEP.SET:
        Component = PinSetWrapper;
        break;
      default:
        return <div>Not Implemented</div>;
    }
    return <Component
      {...this.props}
      onGoTo={this.handleGoTo}
    />
  }

  handleGoTo = step => {
    const queue = [...this.state.queue];
    queue.push(this.state.step);
    this.setState({
      queue,
      step
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];
    const step = queue.pop();
    this.setState({
      queue,
      step
    });
  };
}

PinWrapper.propTypes = {
  step: PropTypes.string
};
export default PinWrapper;
