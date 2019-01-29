/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import { ButtonUnsendStatus } from './ButtonUnsend';
import { checkUserGuideSteps } from '../utils/electronEventInterface';
import { USER_GUIDE_STEPS } from './UserGuide';
import string from '../lang';
import {
  setCryptoInterfaces,
  setDownloadHandler,
  setFileSuccessHandler
} from '../utils/FileManager';
import { downloadFileInFileSystem } from '../utils/ipc';

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
      emailContent: props.email.content,
      inlineImages: []
    };
  }

  render() {
    return (
      <Email
        {...this.props}
        emailContent={this.state.emailContent}
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

  componentWillReceiveProps(nextProps) {
    if (
      this.state.inlineImages.length === 0 &&
      this.state.inlineImages.length !== nextProps.inlineImages.length
    ) {
      this.setState({ inlineImages: nextProps.inlineImages }, async () => {
        await this.handleDownloadInlineImages();
      });
    }
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

  handleSuccessDownloadInlineImage = async ({ token, url }) => {
    const [inlineImage] = this.state.inlineImages.filter(
      img => img.token === token
    );
    if (inlineImage) {
      const downloadParams = {
        downloadType: 'inline',
        filename: inlineImage.name,
        metadataKey: this.props.email.key,
        url
      };
      const filePath = await downloadFileInFileSystem(downloadParams);
      this.injectImagePathIntoEmailContent(filePath, inlineImage.cid);
    }
  };

  injectImagePathIntoEmailContent = (imgPath, cid) => {
    const prevContent = this.state.emailContent;
    const newContent = prevContent.replace(
      `src="cid:${cid}"`,
      `src="${imgPath}"`
    );
    this.setState({ emailContent: newContent });
  };

  handleDownloadInlineImages = () => {
    const inlineImages = this.state.inlineImages;
    setFileSuccessHandler(this.handleSuccessDownloadInlineImage);
    for (const inlineImg of inlineImages) {
      const { key, iv } = inlineImg;
      setCryptoInterfaces(key, iv);
      setDownloadHandler(inlineImg.token);
    }
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  email: PropTypes.object,
  files: PropTypes.array,
  inlineImages: PropTypes.array,
  onEditDraft: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onLoadFiles: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
