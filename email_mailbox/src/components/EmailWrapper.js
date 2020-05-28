/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import { ButtonUnsendStatus } from './ButtonUnsend';
import { ButtonStatus } from './ButtonIcon';
import {
  checkUserGuideSteps,
  sendBlockRemoteContentTurnedOff,
  sendBlockRemoteContentError
} from '../utils/electronEventInterface';
import { getContactByIds, setBlockRemoteContent } from '../utils/ipc';
import { USER_GUIDE_STEPS } from './UserGuide';
import string from '../lang';

const { popups } = string;

class EmailWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonUnsendStatus: ButtonUnsendStatus.NORMAL,
      buttonReplyStatus: ButtonStatus.NORMAL,
      displayEmail: false,
      blockImagesInline: true,
      isHiddenPopOverEmailActions: true,
      isHiddenPopOverEmailMoreInfo: true,
      isHiddenPopOverEmailBlocked: true,
      hideView: false,
      popupContent: undefined,
      popupContentBlockRemoteContent: undefined,
      inlineImages: []
    };
  }

  render() {
    return (
      <Email
        {...this.props}
        buttonReplyStatus={this.state.buttonReplyStatus}
        buttonUnsendStatus={this.state.buttonUnsendStatus}
        displayEmail={this.state.displayEmail}
        isHiddenPopOverEmailMoreInfo={this.state.isHiddenPopOverEmailMoreInfo}
        handleBlockingEmail={this.handleBlockingEmailInline}
        handleBlockRemoteContentAccount={this.handleBlockRemoteContentAccount}
        handleIsTrustedContact={this.handleIsTrustedContact}
        blockImagesInline={this.state.blockImagesInline}
        isHiddenPopOverEmailActions={this.state.isHiddenPopOverEmailActions}
        isHiddenPopOverEmailBlocked={this.state.isHiddenPopOverEmailBlocked}
        hideView={this.state.hideView}
        onToggleEmail={this.handleToggleEmail}
        onTooglePopOverEmailMoreInfo={this.handleTooglePopOverEmailMoreInfo}
        onTogglePopOverEmailActions={this.handleTogglePopOverEmailActions}
        onTogglePopOverEmailBlocked={this.handleTogglePopOverEmailBlocked}
        onClickEditDraft={this.handleClickEditDraft}
        onClickUnsendButton={this.handleClickUnsendButton}
        onClickReplyEmail={this.handleReplyEmail}
        popupContent={this.state.popupContent}
        popupContentBlockRemoteContent={
          this.state.popupContentBlockRemoteContent
        }
        handlePopupConfirm={this.handlePopupConfirm}
        handlePopupConfirmBlock={this.handlePopupConfirmBlock}
        dismissPopup={this.dismissPopup}
        handleClickPermanentlyDeleteEmail={
          this.handleClickPermanentlyDeleteEmail
        }
        handleClickBlockRemoteContent={this.handleClickBlockRemoteContent}
      />
    );
  }

  async componentDidMount() {
    const newState = {};
    const { inlineImages, email, blockRemoteContent } = this.props;
    const contactIsTrusted = await this.handleContactIsTrusted(
      email.from[0],
      email.fromContactIds
    );
    const blocking = blockRemoteContent
      ? blockRemoteContent
      : !contactIsTrusted;
    newState['blockImagesInline'] = blocking;
    if (email.unread) newState['displayEmail'] = true;
    if (inlineImages && inlineImages.length > 0)
      newState['inlineImages'] = inlineImages;
    if (Object.keys(newState).length) {
      this.setState(newState, () => {
        if (this.state.inlineImages.length) {
          this.handleDownloadInlineImages(this.state.inlineImages);
        }
      });
    }
    this.setCollapseListener('add');
    const steps = [
      USER_GUIDE_STEPS.SECURE_MESSAGE,
      USER_GUIDE_STEPS.EMAIL_READ
    ];
    checkUserGuideSteps(steps);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.email.content !== this.props.email.content) {
      this.setCollapseListener('add');
    }
  }

  componentWillUnmount() {
    this.setCollapseListener('remove');
  }

  setCollapseListener = typeAction => {
    const divCollapse = document.getElementById(
      `cptx-div-collapse-${this.props.email.key}`
    );
    const blockquote = document.getElementById(
      `blockquote-${this.props.email.key}`
    );
    if (divCollapse && blockquote) {
      const clickHandler = () => {
        if (blockquote.style.display === 'block') {
          divCollapse.classList.remove('cptx-div-expanded');
          divCollapse.classList.add('cptx-div-collapsed');
          blockquote.style.display = 'none';
        } else {
          blockquote.style.display = 'block';
          divCollapse.classList.remove('cptx-div-collapsed');
          divCollapse.classList.add('cptx-div-expanded');
        }
      };

      if (typeAction === 'add') {
        divCollapse.addEventListener('click', clickHandler);
      } else if (typeAction === 'remove') {
        divCollapse.removeEventListener('click', clickHandler);
      }
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

  handleContactIsTrusted = async (contact, contactIds) => {
    if (contact.isTrusted) {
      return contact.isTrusted === 1;
    }
    const [contactsDB] = await getContactByIds(contactIds);
    return contactsDB.isTrusted === 1;
  };

  handleReplyEmail = ev => {
    this.setState({ buttonReplyStatus: ButtonStatus.DISABLED });
    this.props.onReplyEmail(ev);
    setTimeout(() => {
      this.setState({ buttonReplyStatus: ButtonStatus.NORMAL });
    }, 1000);
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

  handleTogglePopOverEmailBlocked = ev => {
    if (ev) ev.stopPropagation();
    this.setState({
      isHiddenPopOverEmailBlocked: !this.state.isHiddenPopOverEmailBlocked
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

  handleClickBlockRemoteContent = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({
      popupContentBlockRemoteContent: popups.block_remote_content
    });
  };

  handlePopupConfirm = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ popupContent: undefined }, this.props.onDeletePermanently);
  };

  handlePopupConfirmBlock = async ev => {
    ev.stopPropagation();
    ev.preventDefault();
    const { status } = await setBlockRemoteContent(false);
    if (status === 200) {
      await this.props.onChangeEmailBlockedAccount();
      sendBlockRemoteContentTurnedOff();
    } else {
      sendBlockRemoteContentError();
    }
    this.setState({
      popupContentBlockRemoteContent: undefined,
      blockImagesInline: false
    });
  };

  dismissPopup = () => {
    this.setState({
      popupContent: undefined,
      popupContentBlockRemoteContent: undefined
    });
  };

  handleDownloadInlineImages = async inlineImages => {
    await this.props.onDownloadInlineImages(
      inlineImages,
      cidFilepathPairsCallback => {
        const newContent = this.props.onInjectFilepathsOnEmailContentByCid(
          this.props.email.content,
          cidFilepathPairsCallback
        );
        this.props.onUpdateEmailContent(newContent);
      }
    );
  };

  handleBlockingEmailInline = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ blockImagesInline: false });
  };

  handleIsTrustedContact = async ev => {
    ev.stopPropagation();
    ev.preventDefault();
    await this.props.onChangeEmailBlockingContact();
    this.setState({ blockImagesInline: false });
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  blockRemoteContent: PropTypes.bool,
  email: PropTypes.object,
  files: PropTypes.array,
  inlineImages: PropTypes.array,
  onChangeEmailBlockedAccount: PropTypes.func,
  onChangeEmailBlockingContact: PropTypes.func,
  onEditDraft: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onDownloadInlineImages: PropTypes.func,
  onInjectFilepathsOnEmailContentByCid: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  onUpdateEmailContent: PropTypes.func,
  staticOpen: PropTypes.bool
};

export default EmailWrapper;
