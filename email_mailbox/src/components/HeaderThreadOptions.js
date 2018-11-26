import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StandardOptions from './StandardOptions';
import ButtonCircle from './ButtonCircle';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import string from '../lang';
import './headerthreadoptions.scss';

class HeaderThreadOptions extends Component {
  render() {
    const {
      displayFolderMenu,
      displayTagsMenu,
      displayDotsMenu,
      isVisibleArchiveButton,
      isVisibleMoveToInboxButton,
      isVisibleRestoreButton,
      isVisibleSpamButton,
      isVisibleTrashButton,
      isVisibleDeleteButton,
      isVisibleDiscardDraftsButton,
      markAsUnread,
      onClickMoveToArchive,
      onClickDeleteThread,
      onClickDiscardDrafts,
      onClickMoveToInbox,
      onClickMoveToSpam,
      onClickMoveToTrash,
      onClickRestore,
      onToggleFolderMenu,
      onToggleTagsMenu
    } = this.props;
    return (
      <div className="header-threadoptions">
        {this.renderSelectionInteraction()}
        <StandardOptions
          displayFolderMenu={displayFolderMenu}
          displayTagsMenu={displayTagsMenu}
          isVisibleArchiveButton={isVisibleArchiveButton}
          isVisibleDeleteButton={isVisibleDeleteButton}
          isVisibleDiscardDraftsButton={isVisibleDiscardDraftsButton}
          isVisibleMoveToInboxButton={isVisibleMoveToInboxButton}
          isVisibleRestoreButton={isVisibleRestoreButton}
          isVisibleSpamButton={isVisibleSpamButton}
          isVisibleTrashButton={isVisibleTrashButton}
          onClickMoveToArchive={onClickMoveToArchive}
          onClickDeleteThread={onClickDeleteThread}
          onClickDiscardDrafts={onClickDiscardDrafts}
          onClickMoveToInbox={onClickMoveToInbox}
          onClickMoveToSpam={onClickMoveToSpam}
          onClickMoveToTrash={onClickMoveToTrash}
          onClickRestore={onClickRestore}
          onToggleFolderMenu={onToggleFolderMenu}
          onToggleTagsMenu={onToggleTagsMenu}
        />
        {this.renderMoreOptions()}
        <TooltipMenu
          title="Move to:"
          dismiss={onToggleFolderMenu}
          targetId="actionMove"
          display={displayFolderMenu}
        >
          <ul className="multiselect-list">
            <li onClick={onClickMoveToSpam}>
              <span>Spam</span>
            </li>
            <li onClick={onClickMoveToTrash}>
              <span>Trash</span>
            </li>
          </ul>
        </TooltipMenu>
        <TooltipMenu
          title="Add Label:"
          dismiss={onToggleTagsMenu}
          targetId="actionTag"
          display={displayTagsMenu}
        >
          <ul className="multiselect-list">{this.renderLabels()}</ul>
        </TooltipMenu>
        <TooltipMenu
          toLeft={true}
          dismiss={this.props.onToggleDotsMenu}
          targetId="actionDots"
          display={displayDotsMenu}
        >
          <ul className="multiselect-list">
            <li onClick={() => this.props.onClickMarkAsRead()}>
              <span>{markAsUnread ? 'Mark as Unread' : 'Mark as Read'}</span>
            </li>
          </ul>
        </TooltipMenu>
      </div>
    );
  }

  renderSelectionInteraction = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={() => this.props.onBackOption()}
        tip={string.header.dismiss}
        enableTip={true}
        icon="icon-back"
        targetName="actionDismiss"
      />
      {this.props.itemsChecked ? (
        <div className="button-string-container">
          <ButtonCircle
            onClick={() =>
              this.props.onCheckAllThreadItems(
                this.props.allSelected,
                this.props.threadIds
              )
            }
            enableTip={false}
            myClass={this.props.allSelected ? 'menu-select-all' : ''}
            icon={this.props.allSelected ? 'icon-check' : 'icon-box'}
          />
          <span>{`${this.props.itemsChecked.size} ${this.defineSelectedText(
            this.props.itemsChecked.size
          )}`}</span>
        </div>
      ) : null}
    </div>
  );

  renderMoreOptions = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={this.props.onToggleDotsMenu}
        targetName="actionDots"
        icon="icon-dots"
        enableTip={false}
      />
    </div>
  );

  renderLabels = () => {
    return this.props.labels.map((label, index) => (
      <li key={index}>
        <CustomCheckbox
          onCheck={checked => {
            this.props.onClickLabelCheckbox(checked, label.id);
          }}
          label={label.text}
          status={label.checked}
        />
      </li>
    ));
  };

  defineSelectedText = value => {
    return value > 1 ? string.header.selected_plural : string.header.selected;
  };
}

HeaderThreadOptions.propTypes = {
  allSelected: PropTypes.bool,
  displayFolderMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  displayDotsMenu: PropTypes.bool,
  isVisibleArchiveButton: PropTypes.bool,
  isVisibleDeleteButton: PropTypes.bool,
  isVisibleDiscardDraftsButton: PropTypes.bool,
  isVisibleMoveToInboxButton: PropTypes.bool,
  isVisibleRestoreButton: PropTypes.bool,
  isVisibleSpamButton: PropTypes.bool,
  isVisibleTrashButton: PropTypes.bool,
  itemsChecked: PropTypes.object,
  labels: PropTypes.array,
  markAsUnread: PropTypes.bool,
  onBackOption: PropTypes.func,
  onCheckAllThreadItems: PropTypes.func,
  onClickDeleteThread: PropTypes.func,
  onClickDiscardDrafts: PropTypes.func,
  onClickLabelCheckbox: PropTypes.func,
  onClickMoveToArchive: PropTypes.func,
  onClickMoveToInbox: PropTypes.func,
  onClickMoveToSpam: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onClickMarkAsRead: PropTypes.func,
  onClickRestore: PropTypes.func,
  onToggleDotsMenu: PropTypes.func,
  onToggleFolderMenu: PropTypes.func,
  onToggleTagsMenu: PropTypes.func,
  threadIds: PropTypes.object
};

export default HeaderThreadOptions;
