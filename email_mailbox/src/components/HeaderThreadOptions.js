import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StandardOptions from './StandardOptions';
import ButtonCircle from './ButtonCircle';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import DialogPopup from './DialogPopup';
import PopupHOC from './PopupHOC';
import string from '../lang';
import './headerthreadoptions.scss';

const DeleteThreadsPopup = PopupHOC(DialogPopup);

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
      onToggleTagsMenu,
      popupContent,
      dismissPopup,
      handlePopupConfirm
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
              <span>
                {!markAsUnread
                  ? string.mailbox.mark_as_unread
                  : string.mailbox.mark_as_read}
              </span>
            </li>
            {!this.props.itemsChecked && (
              <li onClick={this.props.onClickPrintAllThread}>
                <span>{string.header.print_all}</span>
              </li>
            )}
          </ul>
        </TooltipMenu>
        {popupContent && (
          <DeleteThreadsPopup
            {...popupContent}
            onLeftButtonClick={dismissPopup}
            onRightButtonClick={handlePopupConfirm}
            onTogglePopup={dismissPopup}
            theme={'dark'}
          />
        )}
      </div>
    );
  }

  renderSelectionInteraction = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={() => this.props.onBackOption()}
        tip={
          this.props.itemsChecked ? string.header.dismiss : string.header.back
        }
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
          <span>{this.defineSelectedText(this.props.itemsChecked)}</span>
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

  defineSelectedText = itemsChecked => {
    if (!itemsChecked) return '';
    const value = itemsChecked.size;
    const selectedText =
      value > 1 ? string.header.selected_plural : string.header.selected;
    return `${value} ${selectedText}`;
  };
}

HeaderThreadOptions.propTypes = {
  allSelected: PropTypes.bool,
  dismissPopup: PropTypes.func,
  displayFolderMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  displayDotsMenu: PropTypes.bool,
  handlePopupConfirm: PropTypes.func,
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
  onClickPrintAllThread: PropTypes.func,
  onClickRestore: PropTypes.func,
  onToggleDotsMenu: PropTypes.func,
  onToggleFolderMenu: PropTypes.func,
  onToggleTagsMenu: PropTypes.func,
  popupContent: PropTypes.object,
  threadIds: PropTypes.object
};

export default HeaderThreadOptions;
