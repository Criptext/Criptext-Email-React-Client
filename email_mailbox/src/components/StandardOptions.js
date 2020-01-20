import React from 'react';
import PropTypes from 'prop-types';
import ButtonCircle from './ButtonCircle';
import string from '../lang';
import './standardoptions.scss';

const StandardOptions = props => (
  <div className="header-action">
    {props.isVisibleArchiveButton && (
      <ButtonCircle
        onClick={props.onClickMoveToArchive}
        tip={string.header.archive}
        enableTip={true}
        icon="icon-archive"
        targetName="actionArchive"
      />
    )}
    {props.isVisibleMoveToInboxButton && (
      <ButtonCircle
        onClick={props.onClickMoveToInbox}
        tip={string.header.move_to_inbox}
        enableTip={true}
        icon="icon-mailbox"
        targetName="actionToInbox"
      />
    )}
    {props.isVisibleRestoreButton && (
      <ButtonCircle
        onClick={props.onClickRestore}
        tip={string.header.restore}
        enableTip={true}
        icon="icon-mailbox"
        targetName="actionRestore"
      />
    )}
    {props.isVisibleNotSpamButton && (
      <ButtonCircle
        onClick={props.onClickRestore}
        tip={string.header.not_spam}
        enableTip={true}
        icon="icon-mailbox"
        targetName="actionRestore"
      />
    )}
    {props.isVisibleSpamButton && (
      <ButtonCircle
        onClick={props.onClickMoveToSpam}
        tip={string.labelsItems.spam}
        enableTip={true}
        icon="icon-not"
        targetName="actionSpam"
      />
    )}
    {props.isVisibleTrashButton && (
      <ButtonCircle
        onClick={props.onClickMoveToTrash}
        tip={string.labelsItems.trash}
        enableTip={true}
        icon="icon-trash"
        targetName="actionTrash"
      />
    )}
    {props.isVisibleDeleteButton && (
      <ButtonCircle
        onClick={props.onClickDeleteThread}
        tip={string.header.delete}
        enableTip={true}
        icon="icon-trash-permanently"
        targetName="actionDelete"
      />
    )}
    {props.isVisibleDiscardDraftsButton && (
      <ButtonCircle
        onClick={props.onClickDiscardDrafts}
        tip={string.header.discard_drafts}
        enableTip={true}
        icon="icon-trash"
        targetName="actionDiscardDrafts"
      />
    )}
    {props.isVisibleFolderButton && (
      <ButtonCircle
        onClick={props.onToggleFolderMenu}
        tip={string.header.move_to}
        enableTip={!props.displayFolderMenu}
        icon="icon-file"
        targetName="actionMove"
      />
    )}
    <ButtonCircle
      onClick={props.onToggleTagsMenu}
      tip={string.header.add_labels}
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
  isVisibleNotSpamButton: PropTypes.bool,
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
