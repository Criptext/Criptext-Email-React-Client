import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonUnsend from './ButtonUnsend';

class ButtonUnsendWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayLoading: false
    };
  }

  render() {
    return (
      <ButtonUnsend
        displayLoading={this.state.displayLoading}
        onClick={this.onClick}
        {...this.props}
      />
    );
  }

  onClick = () => {
    this.setState({
      displayLoading: true
    });
    this.props.onClicked(true);
  };
}

ButtonUnsendWrapper.propTypes = {
  displayPopOver: PropTypes.bool,
  onClicked: PropTypes.func,
  onTogglePopOver: PropTypes.func
};

export default ButtonUnsendWrapper;
