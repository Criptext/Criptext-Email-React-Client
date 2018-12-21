import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import { ButtonUnsendStatus } from './ButtonUnsend';
import { checkUserGuideSteps } from '../utils/electronEventInterface';
import { USER_GUIDE_STEPS } from './UserGuide';

class EmailWrapper extends Component {
  constructor() {
    super();
    this.state = {
      buttonUnsendStatus: ButtonUnsendStatus.NORMAL,
      displayEmail: false,
      isHiddenPopOverEmailActions: true,
      isHiddenPopOverEmailMoreInfo: true,
      hideView: false
    };
  }

  render() {
    return (
      <Email
        buttonUnsendStatus={this.state.buttonUnsendStatus}
        displayEmail={this.state.displayEmail}
        isHiddenPopOverEmailMoreInfo={this.state.isHiddenPopOverEmailMoreInfo}
        isHiddenPopOverEmailActions={this.state.isHiddenPopOverEmailActions}
        hideView={this.state.hideView}
        onToggleEmail={this.handleToggleEmail}
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
    const divCollapse = document.getElementById(
      `div-collapse-${this.props.email.key}`
    );
    const blockquote = document.getElementById(
      `blockquote-${this.props.email.key}`
    );
    if (divCollapse && blockquote) {
      divCollapse.addEventListener('click', function() {
        if (blockquote.style.display === 'block') {
          blockquote.style.display = 'none';
        } else {
          blockquote.style.display = 'block';
        }
      });
    }
    const steps = [USER_GUIDE_STEPS.EMAIL_READ];
    checkUserGuideSteps(steps);
  }

  handleToggleEmail = () => {
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
        buttonUnsendStatus: ButtonUnsendStatus.LOAD,
        hideView: !value
      },
      async () => {
        await this.props.onUnsendEmail();
        this.setState({
          buttonUnsendStatus: ButtonUnsendStatus.NORMAL,
          hideView: value
        });
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
