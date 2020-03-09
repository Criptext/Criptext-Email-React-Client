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
      />
    );
  }

  handleOnClickChangeStep = newState => {
    console.log(newState);
    console.log('holi mundo');
    this.setState({ currentStep: newState });
  };
}

export default CustomDomainsWrapper;
