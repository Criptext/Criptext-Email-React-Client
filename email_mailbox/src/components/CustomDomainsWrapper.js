import React, { Component } from 'react';
import CustomDomains from './CustomDomains';

class CustomDomainsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0
    };
  }

  render() {
    return (
      <CustomDomains
        currentStep={this.state.currentStep}
        onClickChangeStep={this.handleOnClickChangeStep}
        onClickMinusStep={this.handleOnClickMinusStep}
      />
    );
  }

  handleOnClickChangeStep = newStep => {
    this.setState({ currentStep: newStep });
  };

  handleOnClickMinusStep = () => {
    const actualState = this.state.currentStep;
    const previousState = actualState - 1;
    this.setState({ currentStep: previousState });
  };
}

export default CustomDomainsWrapper;
