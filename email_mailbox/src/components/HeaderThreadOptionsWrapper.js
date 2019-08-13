import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptions from './HeaderThreadOptions';
import { CustomCheckboxStatus } from './CustomCheckbox';
import { LabelType } from '../utils/electronInterface';
import string from '../lang';

const { popups } = string;

class HeaderThreadOptionsWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayFolderMenu: false,
      displayTagsMenu: false,
      displayDotsMenu: false,
      popupContent: undefined
    };
  }

  render() {
    return (
      <HeaderThreadOptions
        popupContent={this.state.popupContent}
        handlePopupConfirm={this.handlePopupConfirm}
        dismissPopup={this.dismissPopup}
        displayFolderMenu={this.state.displayFolderMenu}
        displayTagsMenu={this.state.displayTagsMenu}
        displayDotsMenu={this.state.displayDotsMenu}
        isVisibleArchiveButton={this.isVisibleArchiveButton()}
        isVisibleMoveToInboxButton={this.isVisibleMoveToInboxButton()}
        isVisibleRestoreButton={this.isVisibleRestoreButton()}
        isVisibleSpamButton={this.isVisibleSpamButton()}
        isVisibleTrashButton={this.isVisibleTrashButton()}
        isVisibleDeleteButton={this.isVisibleDeleteButton()}
        isVisibleDiscardDraftsButton={this.isVisibleDiscardDraftsButton()}
        onToggleFolderMenu={this.handleToggleFolderMenu}
        onToggleTagsMenu={this.handleToggleTagsMenu}
        onToggleDotsMenu={this.handleToggleDotsMenu}
        onClickDeleteThread={this.handleClickDeleteThread}
        onClickDiscardDrafts={this.handleClickDiscardDrafts}
        onClickMarkAsRead={this.handleClickMarkAsRead}
        onClickMoveToArchive={this.handleClickMoveToArchive}
        onClickMoveToInbox={this.handleClickMoveToInbox}
        onClickMoveToSpam={this.handleClickMoveToSpam}
        onClickMoveToTrash={this.handleClickMoveToTrash}
        onClickLabelCheckbox={this.handleOnClickLabelCheckbox}
        onClickRestore={this.handleClickRestore}
        onClickPrintAllThread={this.handleClickPrintAllThread}
        {...this.props}
      />
    );
  }

  handleToggleFolderMenu = () => {
    this.setState({
      displayFolderMenu: !this.state.displayFolderMenu
    });
  };

  handleToggleTagsMenu = () => {
    this.setState({
      displayTagsMenu: !this.state.displayTagsMenu
    });
  };

  handleToggleDotsMenu = () => {
    this.setState({
      displayDotsMenu: !this.state.displayDotsMenu
    });
  };

  isVisibleArchiveButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id
    );
  };

  isVisibleMoveToInboxButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return currentLabelId === LabelType.allmail.id;
  };

  isVisibleRestoreButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return (
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.spam.id
    );
  };

  isVisibleSpamButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.allmail.id ||
      currentLabelId === LabelType.search.id
    );
  };

  isVisibleTrashButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.allmail.id ||
      currentLabelId === LabelType.search.id
    );
  };

  isVisibleDeleteButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return (
      currentLabelId === LabelType.spam.id ||
      currentLabelId === LabelType.trash.id
    );
  };

  isVisibleDiscardDraftsButton = () => {
    const currentLabelId = this.props.mailboxSelected.id;
    return currentLabelId === LabelType.draft.id;
  };

  handleClickMoveToArchive = () => {
    this.props.onRemoveLabel(this.props.threadsSelected, LabelType.inbox.id);
  };

  handleClickMoveToSpam = () => {
    this.props.onAddMoveLabel(this.props.threadsSelected, LabelType.spam.id);
  };

  handleClickMoveToTrash = () => {
    this.props.onAddMoveLabel(this.props.threadsSelected, LabelType.trash.id);
  };

  handleClickDeleteThread = () => {
    this.setState({
      popupContent: popups.permanently_delete
    });
  };

  handlePopupConfirm = () => {
    const backFirst = true;
    this.setState({ popupContent: undefined }, () => {
      this.props.onRemoveThreads(this.props.threadsSelected, backFirst);
    });
  };

  dismissPopup = () => {
    this.setState({ popupContent: undefined });
  };

  handleClickDiscardDrafts = () => {
    this.props.onDiscardDrafts(this.props.threadsSelected);
  };

  handleClickMoveToInbox = () => {
    const labelId = LabelType.inbox.id;
    return this.props.onAddLabel(this.props.threadsSelected, labelId);
  };

  handleOnClickLabelCheckbox = (checked, labelId) => {
    if (CustomCheckboxStatus.toBoolean(checked)) {
      return this.props.onAddLabel(this.props.threadsSelected, labelId);
    }
    return this.props.onRemoveLabel(this.props.threadsSelected, labelId, true);
  };

  handleClickMarkAsRead = () => {
    this.setState(
      {
        displayDotsMenu: false
      },
      () => {
        this.props.onMarkRead(
          this.props.threadsSelected,
          this.props.markAsUnread
        );
      }
    );
  };

  handleClickRestore = () => {
    const LabelIdToDelete =
      this.props.mailboxSelected.id === LabelType.trash.id
        ? LabelType.trash.id
        : LabelType.spam.id;
    this.props.onRemoveLabel(this.props.threadsSelected, LabelIdToDelete);
  };

  handleClickPrintAllThread = () => {
    this.setState(
      {
        displayDotsMenu: false
      },
      () => {
        this.props.onPrintAllThread();
      }
    );
  };
}

HeaderThreadOptionsWrapper.propTypes = {
  mailboxSelected: PropTypes.object,
  markAsUnread: PropTypes.bool,
  onAddLabel: PropTypes.func,
  onAddMoveLabel: PropTypes.func,
  onDiscardDrafts: PropTypes.func,
  onMarkRead: PropTypes.func,
  onPrintAllThread: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onRemoveThreads: PropTypes.func,
  threadsSelected: PropTypes.array
};

export default HeaderThreadOptionsWrapper;
