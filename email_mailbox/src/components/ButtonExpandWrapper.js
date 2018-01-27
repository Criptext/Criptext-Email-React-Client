import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonExpand, { ButtonExpandType } from './ButtonExpand';

class ButtonExpandWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayPopOver: false
    };
  }

  render() {
    return (
      <ButtonExpand
        displayPopOver={this.state.displayPopOver}
        onTogglePopOver={this.onTogglePopOver}
        {...this.props}
      />
    );
  }

  onTogglePopOver = () => {
    this.setState({
      displayPopOver: !this.state.displayPopOver
    });
  };
}

ButtonExpandWrapper.propTypes = {
  displayPopOver: PropTypes.bool,
  onTogglePopOver: PropTypes.func
};

export { ButtonExpandWrapper as default, ButtonExpandType };
