import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PinStart from './PinStart';
import PinDisplay from './PinDisplay';
import PinSetWrapper from './PinSetWrapper';
import SaveKeyWrapper from './SaveKeyWrapper';
import PinDoneWrapper from './PinDoneWrapper';

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
      states: [],
      step: STEP.START,
      previousState: null,
      storeData: {
        defaultPin: `${Math.round(Math.random() * 9000) + 1000}`
      }
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
      case STEP.SAVE:
        Component = SaveKeyWrapper;
        break;
      case STEP.DONE:
        Component = PinDoneWrapper;
        break;
      default:
        return <div>Not Implemented</div>;
    }
    return (
      <Component
        {...this.props}
        onGoTo={this.handleGoTo}
        onGoBack={this.handleGoBack}
        previousState={this.state.previousState}
        storeData={this.state.storeData}
        onNext={this.handleNext}
      />
    );
  }

  handleNext = () => {
    this.props.onGoTo('setup');
  };

  handleGoTo = (step, storeData = {}, state) => {
    const queue = [...this.state.queue];
    queue.push(this.state.step);
    const states = [...this.state.states];
    states.push(state);
    this.setState({
      queue,
      states,
      step,
      storeData: {
        ...this.state.storeData,
        ...storeData
      }
    });
  };

  handleGoBack = () => {
    const queue = [...this.state.queue];
    if (queue.length <= 0) {
      return;
    }

    const step = queue.pop();
    const states = [...this.state.states];
    const previousState = states.pop();
    this.setState({
      queue,
      states,
      previousState,
      step
    });
  };
}

PinWrapper.propTypes = {
  step: PropTypes.string
};
export default PinWrapper;
