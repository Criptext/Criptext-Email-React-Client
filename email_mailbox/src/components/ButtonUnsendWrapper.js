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
        onClick={this.handleClick}
      />
    );
  }

  handleClick = ev => {
    if (ev) ev.stopPropagation();
    this.setState({
      displayLoading: true
    });
    this.props.onClick(true);
  };
}

ButtonUnsendWrapper.propTypes = {
  displayPopOver: PropTypes.bool,
  onClick: PropTypes.func,
  onTogglePopOver: PropTypes.func
};

export default ButtonUnsendWrapper;
