import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';

class EmailWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayEmail: false,
      displayMenu: false
    };
  }

  render() {
    return (
      <Email
        displayEmail={this.state.displayEmail}
        displayMenu={this.state.displayMenu}
        onToggleEmail={this.onToggleEmail}
        onToogleMenu={this.onToggleMenu}
        {...this.props}
      />
    );
  }

  onToggleEmail = () => {
    if (!this.props.staticOpen) {
      this.setState({
        displayEmail: !this.state.displayEmail
      });
    }
  };

  onToggleMenu = () => {
    this.setState({
      displayMenu: !this.state.displayMenu
    });
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
