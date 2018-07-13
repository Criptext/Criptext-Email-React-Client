import React, { Component } from 'react';
import NonCriptext, { PopUpModes } from './NonCriptext';

class NonCriptextWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: PopUpModes.SET_PASSWORD,
      hasErrors: false
    };
  }

  render() {
    return (
      <NonCriptext
        {...this.props}
        mode={this.state.mode}
        onChangeSwitch={this.handleChangeSwitch}
      />
    );
  }

  handleChangeSwitch = () => {
    this.setState(prevState => {
      if (prevState.mode === PopUpModes.NO_PASSWORD) {
        return { mode: PopUpModes.SET_PASSWORD };
      }
      return { mode: PopUpModes.NO_PASSWORD };
    });
  };
}

export default NonCriptextWrapper;
