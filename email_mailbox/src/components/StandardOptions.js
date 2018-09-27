import React from 'react';
import PropTypes from 'prop-types';
import ButtonCircle from './ButtonCircle';
import './standardoptions.css';

const StandardOptions = props => (
  <div className="header-action">
    {props.isVisibleArchiveButton && (
      <ButtonCircle
        onClick={props.onClickMoveToArchive}
        tip="Archive"
        enableTip={true}
        icon="icon-archive"
        targetName="actionArchive"
      />
    )}
    {props.isVisibleMoveToInboxButton && (
      <ButtonCircle
        onClick={props.onClickMoveToInbox}
        tip="Move to Inbox"
        enableTip={true}
        icon="icon-archive"
        targetName="actionToInbox"
      />
    )}
    {props.isVisibleRestoreButton && (
      <ButtonCircle
        onClick={props.onClickRestore}
        tip="Restore"
        enableTip={true}
        icon="icon-archive"
        targetName="actionRestore"
      />
    )}
    {props.isVisibleSpamButton && (
      <ButtonCircle
        onClick={props.onClickMoveToSpam}
        tip="Spam"
        enableTip={true}
        icon="icon-not"
        targetName="actionSpam"
      />
    )}
    {props.isVisibleTrashButton && (
      <ButtonCircle
        onClick={props.onClickMoveToTrash}
        tip="Trash"
        enableTip={true}
        icon="icon-trash"
        targetName="actionTrash"
      />
    )}
    {props.isVisibleDeleteButton && (
      <ButtonCircle
        onClick={props.onClickDeleteThread}
        tip="Delete"
        enableTip={true}
        icon="icon-trash"
        targetName="actionDelete"
      />
    )}
    {props.isVisibleDiscardDraftsButton && (
      <ButtonCircle
        onClick={props.onClickDiscardDrafts}
        tip="Discard drafts"
        enableTip={true}
        icon="icon-trash"
        targetName="actionDiscardDrafts"
      />
    )}
    {props.isVisibleFolderButton && (
      <ButtonCircle
        onClick={props.onToggleFolderMenu}
        tip="Move to"
        enableTip={!props.displayFolderMenu}
        icon="icon-file"
        targetName="actionMove"
      />
    )}
    <ButtonCircle
      onClick={props.onToggleTagsMenu}
      tip="Add Labels"
      enableTip={!props.displayTagsMenu}
      icon="icon-tag"
      targetName="actionTag"
    />
  </div>
);

StandardOptions.propTypes = {
  displayFolderMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  isVisibleArchiveButton: PropTypes.bool,
  isVisibleDeleteButton: PropTypes.bool,
  isVisibleDiscardDraftsButton: PropTypes.bool,
  isVisibleFolderButton: PropTypes.bool,
  isVisibleMoveToInboxButton: PropTypes.bool,
  isVisibleRestoreButton: PropTypes.bool,
  isVisibleSpamButton: PropTypes.bool,
  isVisibleTrashButton: PropTypes.bool,
  onClickMoveToArchive: PropTypes.func,
  onClickDeleteThread: PropTypes.func,
  onClickDiscardDrafts: PropTypes.func,
  onClickMoveToInbox: PropTypes.func,
  onClickMoveToSpam: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onClickRestore: PropTypes.func,
  onToggleFolderMenu: PropTypes.func,
  onToggleTagsMenu: PropTypes.func
};

export default StandardOptions;
