import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';

class EmailWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayEmail: false,
      displayPopOverEmailDetail: false,
      displayPopOverMenuAction: false
    };
  }

  render() {
    return (
      <Email
        displayEmail={this.state.displayEmail}
        displayPopOverEmailDetail={this.state.displayPopOverEmailDetail}
        displayPopOverMenuAction={this.state.displayPopOverMenuAction}
        onToggleEmail={this.onToggleEmail}
        onTooglePopOverEmailDetail={this.onTooglePopOverEmailDetail}
        onTogglePopOverMenuAction={this.onTogglePopOverMenuAction}
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

  onTooglePopOverEmailDetail = () => {
    this.setState({
      displayPopOverEmailDetail: !this.state.displayPopOverEmailDetail
    });
  };

  onTogglePopOverMenuAction = () => {
    this.setState({
      displayPopOverMenuAction: !this.state.displayPopOverMenuAction
    });
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
