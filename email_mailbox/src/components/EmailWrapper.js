/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import { ButtonUnsendStatus } from './ButtonUnsend';
import { ButtonStatus } from './ButtonIcon';
import {
  checkUserGuideSteps,
  sendBlockRemoteContentTurnedOff,
  sendContactIsTrusted,
  sendBlockRemoteContentError
} from '../utils/electronEventInterface';
import { mySettings } from '../utils/electronInterface';
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
      blockImagesContact: true,
      blockImagesAccount: true,
      isHiddenPopOverEmailActions: true,
      isHiddenPopOverEmailMoreInfo: true,
      isHiddenPopOverEmailBlocked: true,
      hasImages: false,
      hideView: false,
      popupContent: undefined,
      popupContentBlockRemoteContent: undefined,
      inlineImages: [],
      isLoadingBlockRemote: false,
      language: 'en',
      showLightsOn: mySettings.theme === 'dark',
      lightsOn: false
    };
  }

  render() {
    return (
      <Email
        {...this.props}
        language={this.state.language}
        buttonReplyStatus={this.state.buttonReplyStatus}
        buttonUnsendStatus={this.state.buttonUnsendStatus}
        displayEmail={this.state.displayEmail}
        isHiddenPopOverEmailMoreInfo={this.state.isHiddenPopOverEmailMoreInfo}
        handleBlockingEmail={this.handleBlockingEmailInline}
        handleBlockRemoteContentAccount={this.handleBlockRemoteContentAccount}
        handleIsTrustedContact={this.handleIsTrustedContact}
        blockImagesInline={this.state.blockImagesInline}
        blockImagesContact={this.state.blockImagesContact}
        blockImagesAccount={this.state.blockImagesAccount}
        isHiddenPopOverEmailActions={this.state.isHiddenPopOverEmailActions}
        isHiddenPopOverEmailBlocked={this.state.isHiddenPopOverEmailBlocked}
        isLoadingBlockRemote={this.state.isLoadingBlockRemote}
        hideView={this.state.hideView}
        showLightsOn={this.state.showLightsOn}
        lightsOn={this.state.lightsOn}
        onLightsOn={this.handleLightsOn}
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
    await this.handleInlineImages();
    this.setCollapseListener('add');
    const steps = [
      USER_GUIDE_STEPS.SECURE_MESSAGE,
      USER_GUIDE_STEPS.EMAIL_READ
    ];
    checkUserGuideSteps(steps);
  }

  handleLightsOn = () => {
    this.setState({
      lightsOn: !this.state.lightsOn
    });
  };

  handleInlineImages = async () => {
    const newState = {};
    const {
      inlineImages,
      email,
      blockRemoteContent,
      isSpam,
      isFromMe
    } = this.props;
    const contactIsTrusted = await this.handleContactIsTrusted(
      email.from[0],
      email.fromContactIds
    );

    const hasImages = this.hasImages();

    const {
      blockingInline,
      blockImagesContact,
      blockImagesAccount
    } = this.setBlockingVariables({
      blockRemoteContent,
      contactIsTrusted,
      isSpam,
      displayEmail: this.state.displayEmail,
      staticOpen: this.props.staticOpen,
      hasImages,
      isFromMe
    });
    newState['blockImagesInline'] = blockingInline;
    newState['blockImagesContact'] = blockImagesContact;
    newState['blockImagesAccount'] = blockImagesAccount;
    newState['hasImages'] = hasImages;
    newState['language'] = mySettings.language;
    if (email.unread) newState['displayEmail'] = true;
    if (inlineImages && inlineImages.length > 0)
      newState['inlineImages'] = inlineImages;

    this.setState(newState, () => {
      if (this.state.inlineImages.length) {
        this.handleDownloadInlineImages(this.state.inlineImages);
      }
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.email.content !== this.props.email.content) {
      this.setCollapseListener('add');
      if (this.props.email.id === prevProps.email.id) {
        this.handleInlineImages();
      }
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
        divCollapse.removeEventListener('click', clickHandler);
        divCollapse.addEventListener('click', clickHandler);
      } else if (typeAction === 'remove') {
        divCollapse.removeEventListener('click', clickHandler);
      }
    }
  };

  setBlockingVariables = ({
    blockRemoteContent,
    contactIsTrusted,
    isSpam,
    displayEmail,
    staticOpen,
    hasImages,
    isFromMe
  }) => {
    if (isFromMe || !hasImages || (!displayEmail && !staticOpen)) {
      return {
        blockingInline: false,
        blockImagesContact: false,
        blockImagesAccount: false
      };
    } else if (isSpam) {
      return {
        blockingInline: true,
        blockImagesContact: false,
        blockImagesAccount: false
      };
    }
    const theValue = blockRemoteContent ? !contactIsTrusted : false;

    return {
      blockingInline: theValue,
      blockImagesContact: theValue,
      blockImagesAccount: theValue
    };
  };

  handleToggleEmail = async () => {
    if (!this.props.staticOpen) {
      const {
        blockRemoteContent,
        isSpam,
        staticOpen,
        email,
        isFromMe
      } = this.props;
      const { displayEmail, hasImages } = this.state;
      const contactIsTrusted = await this.handleContactIsTrusted(
        email.from[0],
        email.fromContactIds
      );

      const {
        blockingInline,
        blockImagesContact,
        blockImagesAccount
      } = this.setBlockingVariables({
        blockRemoteContent,
        contactIsTrusted,
        isSpam,
        displayEmail: !displayEmail,
        staticOpen,
        hasImages,
        isFromMe
      });
      this.setState({
        displayEmail: !displayEmail,
        blockImagesInline: blockingInline,
        blockImagesContact,
        blockImagesAccount
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

  handlePopupConfirm = ev => {
    if (ev) ev.stopPropagation();
    this.setState({ popupContent: undefined }, this.props.onDeletePermanently);
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
    if (ev) ev.stopPropagation();
    this.setState({ blockImagesInline: false }, () => {
      this.setCollapseListener('add');
    });
  };

  handleIsTrustedContact = async ev => {
    if (ev) ev.stopPropagation();
    await this.props.onChangeEmailBlockingContact();
    sendContactIsTrusted();
    this.setState(
      {
        blockImagesInline: false,
        blockImagesContact: false,
        blockImagesAccount: false
      },
      () => {
        this.setCollapseListener('add');
      }
    );
  };

  handleClickBlockRemoteContent = ev => {
    if (ev) ev.stopPropagation();
    this.setState({
      popupContentBlockRemoteContent: popups.block_remote_content
    });
  };

  handlePopupConfirmBlock = async ev => {
    this.setState({ isLoadingBlockRemote: true });
    if (ev) ev.stopPropagation();
    const { status } = await setBlockRemoteContent(false);
    if (status === 200) {
      await this.props.onChangeEmailBlockedAccount();
      sendBlockRemoteContentTurnedOff();
      this.setState(
        {
          popupContentBlockRemoteContent: undefined,
          blockImagesInline: false,
          blockImagesAccount: false,
          blockImagesContact: false,
          isLoadingBlockRemote: false
        },
        () => {
          this.setCollapseListener('add');
        }
      );
    } else {
      sendBlockRemoteContentError();
      this.setState({
        popupContentBlockRemoteContent: undefined,
        isLoadingBlockRemote: false
      });
    }
  };

  hasImages = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div class="email-container">${this.props.content}</div>`,
      'text/html'
    );
    return [...doc.getElementsByTagName('img')].length;
  };
}

EmailWrapper.propTypes = {
  displayEmail: PropTypes.func,
  blockRemoteContent: PropTypes.bool,
  content: PropTypes.string,
  email: PropTypes.object,
  files: PropTypes.array,
  inlineImages: PropTypes.array,
  isSpam: PropTypes.bool,
  isFromMe: PropTypes.bool,

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
