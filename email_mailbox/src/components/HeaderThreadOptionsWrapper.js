import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptions from './HeaderThreadOptions';
import { CustomCheckboxStatus } from './CustomCheckbox';
import { LabelType } from '../utils/electronInterface';

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
        isVisibleSpamButton={this.isVisibleSpamButton()}
        isVisibleTrashButton={this.isVisibleTrashButton()}
        onToggleFolderMenu={this.handleToggleFolderMenu}
        onToggleTagsMenu={this.handleToggleTagsMenu}
        onToggleDotsMenu={this.handleToggleDotsMenu}
        onClickMarkAsRead={this.handleClickMarkAsRead}
        onClickMoveToSpam={this.handleClickMoveToSpam}
        onClickMoveToTrash={this.handleClickMoveToTrash}
        onClickLabelCheckbox={this.handleOnClickLabelCheckbox}
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

  isVisibleSpamButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.important.id ||
      currentLabelId === LabelType.trash.id ||
      currentLabelId === LabelType.all.id
    );
  };

  isVisibleTrashButton = () => {
    const currentLabelId = LabelType[this.props.mailboxSelected].id;
    return (
      currentLabelId === LabelType.inbox.id ||
      currentLabelId === LabelType.sent.id ||
      currentLabelId === LabelType.starred.id ||
      currentLabelId === LabelType.important.id ||
      currentLabelId === LabelType.all.id
    );
  };

  handleClickMoveToSpam = () => {
    this.props.onAddLabel(this.props.threadsSelected, LabelType.spam.id);
  };

  handleClickMoveToTrash = () => {
    this.props.onAddLabel(this.props.threadsSelected, LabelType.trash.id);
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
}

HeaderThreadOptionsWrapper.propTypes = {
  mailboxSelected: PropTypes.string,
  markAsUnread: PropTypes.bool,
  onAddLabel: PropTypes.func,
  onMarkRead: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  threadsSelected: PropTypes.array
};

export default HeaderThreadOptionsWrapper;
