/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import { ButtonUnsendStatus } from './ButtonUnsend';
import { checkUserGuideSteps } from '../utils/electronEventInterface';
import { USER_GUIDE_STEPS } from './UserGuide';
import string from '../lang';

const { popups } = string;

class EmailWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonUnsendStatus: ButtonUnsendStatus.NORMAL,
      displayEmail: false,
      isHiddenPopOverEmailActions: true,
      isHiddenPopOverEmailMoreInfo: true,
      hideView: false,
      popupContent: undefined,
      inlineImages: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.inlineImages.length === 0 &&
      this.state.inlineImages.length !== nextProps.inlineImages.length
    ) {
      this.setState({ inlineImages: nextProps.inlineImages }, async () => {
        await this.handleDownloadInlineImages(this.state.inlineImages);
      });
    }
  }

  render() {
    return (
      <Email
        {...this.props}
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
        popupContent={this.state.popupContent}
        handlePopupConfirm={this.handlePopupConfirm}
        dismissPopup={this.dismissPopup}
        handleClickPermanentlyDeleteEmail={
          this.handleClickPermanentlyDeleteEmail
        }
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
    this.setCollapseListener();
    const steps = [USER_GUIDE_STEPS.EMAIL_READ];
    checkUserGuideSteps(steps);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.email.content !== this.props.email.content) {
      this.setCollapseListener();
    }
  }

  setCollapseListener = () => {
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
  };

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

  handleClickPermanentlyDeleteEmail = () => {
    this.setState({
      popupContent: popups.permanently_delete
    });
  };

  handlePopupConfirm = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ popupContent: undefined }, this.props.onDeletePermanently);
  };

  dismissPopup = () => {
    this.setState({
      popupContent: undefined
    });
  };

  handleDownloadInlineImages = async inlineImages => {
    await this.props.onDownloadInlineImages(inlineImages, cidFilepathPairs => {
      const newContent = this.props.onInjectFilepathsOnEmailContentByCid(
        this.props.email.content,
        cidFilepathPairs
      );
      this.props.onUpdateEmailContent(newContent);
    });
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  email: PropTypes.object,
  files: PropTypes.array,
  inlineImages: PropTypes.array,
  onEditDraft: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onDownloadInlineImages: PropTypes.func,
  onInjectFilepathsOnEmailContentByCid: PropTypes.func,
  onLoadFiles: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  onUpdateEmailContent: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
