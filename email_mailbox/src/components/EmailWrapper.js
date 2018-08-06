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
        onClickEditDraft={this.handleClickEditDraft}
        onClickUnsendButton={this.handleClickUnsendButton}
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

  handleClickEditDraft = ev => {
    if (ev) ev.stopPropagation();
    this.props.onEditDraft();
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

  handleClickUnsendButton = value => {
    this.setState(
      {
        hideView: !value
      },
      async () => {
        await this.props.onUnsendEmail();
        this.setState({ hideView: value });
      }
    );
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  email: PropTypes.object,
  files: PropTypes.array,
  onEditDraft: PropTypes.func,
  onLoadFiles: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
