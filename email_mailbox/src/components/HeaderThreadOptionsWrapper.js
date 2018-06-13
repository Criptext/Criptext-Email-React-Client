import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptions from './HeaderThreadOptions';
import { CustomCheckboxStatus } from './CustomCheckbox';
import {
  closeDialog,
  confirmPermanentDeleteThread,
  LabelType
} from '../utils/electronInterface';

const CONFIRM_RESPONSE = 'Confirm';

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
        onToggleFolderMenu={this.handleToggleFolderMenu}
        onToggleTagsMenu={this.handleToggleTagsMenu}
        onToggleDotsMenu={this.handleToggleDotsMenu}
        onClickDeleteThread={this.handleClickDeleteThread}
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
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.important.id
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
      currentLabelId === LabelType.important.id ||
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
      currentLabelId === LabelType.important.id ||
      currentLabelId === LabelType.allmail.id
    );
  };

  isVisibleDeleteButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.spam.id ||
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.draft.id
    );
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
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    if (currentLabelId === LabelType.draft.id) {
      this.props.onRemoveDrafts(this.props.threadsSelected);
    } else {
      confirmPermanentDeleteThread(response => {
        closeDialog();
        if (response === CONFIRM_RESPONSE) {
          this.props.onRemoveThreads(this.props.threadsSelected);
        }
      });
    }
  };

  handleClickMoveToInbox = () => {
    const { threadsSelected, allThreads } = this.props;
    this.props.onMoveToInbox(threadsSelected, allThreads);
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
          !this.props.markAsUnread
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
  mailboxSelected: PropTypes.string,
  markAsUnread: PropTypes.bool,
  onAddLabel: PropTypes.func,
  onAddMoveLabel: PropTypes.func,
  onMarkRead: PropTypes.func,
  onMoveToInbox: PropTypes.func,
  onRemoveDrafts: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onRemoveThreads: PropTypes.func,
  threadsSelected: PropTypes.array,
  allThreads: PropTypes.array
};

export default HeaderThreadOptionsWrapper;
