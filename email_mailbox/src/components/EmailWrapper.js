import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';

class EmailWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayEmail: false,
      isHiddenPopOverEmailMoreInfo: true,
      displayPopOverMenuAction: false,
      hideView: false
    };
  }

  render() {
    return (
      <Email
        displayEmail={this.state.displayEmail}
        isHiddenPopOverEmailMoreInfo={this.state.isHiddenPopOverEmailMoreInfo}
        displayPopOverMenuAction={this.state.displayPopOverMenuAction}
        hideView={this.state.hideView}
        onToggleEmail={this.onToggleEmail}
        onTooglePopOverEmailMoreInfo={this.onTooglePopOverEmailMoreInfo}
        onTogglePopOverMenuAction={this.onTogglePopOverMenuAction}
        unsendButtonOnClicked={this.setHideView}
        {...this.props}
      />
    );
  }

  componentDidMount() {
    if (this.props.email.unread) {
      this.setState({
        displayEmail: true
      });
    }
  }

  onToggleEmail = () => {
    if (!this.props.staticOpen) {
      this.setState({
        displayEmail: !this.state.displayEmail
      });
    }
  };

  onTooglePopOverEmailMoreInfo = () => {
    this.setState({
      isHiddenPopOverEmailMoreInfo: !this.state.isHiddenPopOverEmailMoreInfo
    });
  };

  onTogglePopOverMenuAction = ev => {
    ev.stopPropagation();
    this.setState({
      displayPopOverMenuAction: !this.state.displayPopOverMenuAction
    });
  };

  setHideView = value => {
    this.setState({
      hideView: value
    });
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  email: PropTypes.object,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
