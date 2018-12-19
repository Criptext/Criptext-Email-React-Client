import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptions from './HeaderThreadOptions';
import { CustomCheckboxStatus } from './CustomCheckbox';
import {
  confirmPermanentDeleteThread,
  LabelType
} from '../utils/electronInterface';
import { closeDialogWindow } from './../utils/ipc';

class HeaderThreadOptionsWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayFolderMenu: false,
      displayTagsMenu: false,
      displayDotsMenu: false
    };
  }

  render() {
    return (
      <HeaderThreadOptions
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
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id
    );
  };

  isVisibleMoveToInboxButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return currentLabelId === LabelType.allmail.id;
  };

  isVisibleRestoreButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.spam.id
    );
  };

  isVisibleSpamButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.allmail.id
    );
  };

  isVisibleTrashButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.allmail.id
    );
  };

  isVisibleDeleteButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.spam.id ||
      currentLabelId === LabelType.trash.id
    );
  };

  isVisibleDiscardDraftsButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return currentLabelId === LabelType.draft.id;
  };

  handleClickMoveToArchive = () => {
    this.props.onRemoveLabel(this.props.threadsSelected, LabelType.inbox.id);
  };

  handleClickMoveToSpam = () => {
    this.props.onAddMoveLabel(
      this.props.threadsSelected,
      LabelType.spam.id,
      this.props.itemsChecked ? false : true
    );
  };

  handleClickMoveToTrash = () => {
    this.props.onAddMoveLabel(
      this.props.threadsSelected,
      LabelType.trash.id,
      this.props.itemsChecked ? false : true
    );
  };

  handleClickDeleteThread = () => {
    confirmPermanentDeleteThread(response => {
      closeDialogWindow();
      if (response) {
        const backFirst = true;
        this.props.onRemoveThreads(this.props.threadsSelected, backFirst);
      }
    });
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
    return this.props.onRemoveLabel(this.props.threadsSelected, labelId);
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
      LabelType[this.props.mailboxSelected].id === LabelType.trash.id
        ? LabelType.trash.id
        : LabelType.spam.id;
    this.props.onRemoveLabel(this.props.threadsSelected, LabelIdToDelete);
  };
}

HeaderThreadOptionsWrapper.propTypes = {
  itemsChecked: PropTypes.object,
  mailboxSelected: PropTypes.string,
  markAsUnread: PropTypes.bool,
  onAddLabel: PropTypes.func,
  onAddMoveLabel: PropTypes.func,
  onDiscardDrafts: PropTypes.func,
  onMarkRead: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onRemoveThreads: PropTypes.func,
  threadsSelected: PropTypes.array
};

export default HeaderThreadOptionsWrapper;
