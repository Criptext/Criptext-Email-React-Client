import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonUnsend from './ButtonUnsend';

class ButtonUnsendWrapper extends Component {
  render() {
    return (
      <ButtonUnsend onClick={this.handleClick} status={this.props.status} />
    );
  }

  handleClick = ev => {
    if (ev) ev.stopPropagation();
    this.props.onClick(true);
  };
}

ButtonUnsendWrapper.propTypes = {
  onClick: PropTypes.func,
  status: PropTypes.number
};

export default ButtonUnsendWrapper;
