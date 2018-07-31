import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';

class EmailWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayEmail: false,
      isHiddenPopOverEmailActions: true,
      isHiddenPopOverEmailMoreInfo: true,
      hideView: false
    };
  }

  render() {
    return (
      <Email
        displayEmail={this.state.displayEmail}
        isHiddenPopOverEmailMoreInfo={this.state.isHiddenPopOverEmailMoreInfo}
        isHiddenPopOverEmailActions={this.state.isHiddenPopOverEmailActions}
        hideView={this.state.hideView}
        onToggleEmail={this.onToggleEmail}
        onTooglePopOverEmailMoreInfo={this.handleTooglePopOverEmailMoreInfo}
        onTogglePopOverEmailActions={this.handleTogglePopOverEmailActions}
        unsendButtonOnClicked={this.setHideView}
        {...this.props}
      />
    );
  }

  componentDidMount() {
    if (this.props.email.fileTokens.length && !this.props.files.length) {
      this.props.onLoadFiles(this.props.email.fileTokens);
    }
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

  handleTooglePopOverEmailMoreInfo = ev => {
    if (ev) ev.stopPropagation();
    this.setState({
      isHiddenPopOverEmailMoreInfo: !this.state.isHiddenPopOverEmailMoreInfo
    });
  };

  handleTogglePopOverEmailActions = ev => {
    if (ev) ev.stopPropagation();
    this.setState({
      isHiddenPopOverEmailActions: !this.state.isHiddenPopOverEmailActions
    });
  };

  setHideView = value => {
    this.setState(
      {
        hideView: value
      },
      async () => {
        await this.props.unsendEmail();
        this.setState({ hideView: !value });
      }
    );
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  email: PropTypes.object,
  files: PropTypes.array,
  onLoadFiles: PropTypes.func,
  staticOpen: PropTypes.bool,
  unsendEmail: PropTypes.func
};

export default EmailWrapper;
