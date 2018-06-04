import React from 'react';
import PropTypes from 'prop-types';
import ButtonCircle from './ButtonCircle';
import './standardoptions.css';

const StandardOptions = props => (
  <div className="header-action">
    {props.isVisibleArchiveButton ? (
      <ButtonCircle
        onClick={props.onClickMoveToArchive}
        tip="Archive"
        enableTip={true}
        icon="icon-archive"
        targetName="actionArchive"
      />
    ) : null}
    {props.isVisibleRestoreButton ? (
      <ButtonCircle
        onClick={props.onClickRestore}
        tip="Restore"
        enableTip={true}
        icon="icon-archive"
        targetName="actionRestore"
      />
    ) : null}
    {props.isVisibleSpamButton ? (
      <ButtonCircle
        onClick={props.onClickMoveToSpam}
        tip="Spam"
        enableTip={true}
        icon="icon-not"
        targetName="actionSpam"
      />
    ) : null}
    {props.isVisibleTrashButton ? (
      <ButtonCircle
        onClick={props.onClickMoveToTrash}
        tip="Trash"
        enableTip={true}
        icon="icon-trash"
        targetName="actionTrash"
      />
    ) : null}

    {props.isVisibleDeleteButton ? (
      <ButtonCircle
        onClick={props.onClickDeleteThread}
        tip="Delete"
        enableTip={true}
        icon="icon-trash"
        targetName="actionDelete"
      />
    ) : null}

    {props.isVisibleFolderButton ? (
      <ButtonCircle
        onClick={props.onToggleFolderMenu}
        tip="Move to"
        enableTip={!props.displayFolderMenu}
        icon="icon-file"
        targetName="actionMove"
      />
    ) : null}
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
  isVisibleFolderButton: PropTypes.bool,
  isVisibleRestoreButton: PropTypes.bool,
  isVisibleSpamButton: PropTypes.bool,
  isVisibleTrashButton: PropTypes.bool,
  onClickMoveToArchive: PropTypes.func,
  onClickDeleteThread: PropTypes.func,
  onClickMoveToSpam: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onClickRestore: PropTypes.func,
  onToggleFolderMenu: PropTypes.func,
  onToggleTagsMenu: PropTypes.func
};

export default StandardOptions;
