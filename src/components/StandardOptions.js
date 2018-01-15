import React from 'react';
import HeaderOption from './HeaderOption';

const StandardOptions = props => (
  <div className="header-action">
    <HeaderOption
      onClick={props.onActionMove}
      tip="Archive"
      enableTip={true}
      icon="icon-archive"
      targetName="actionArchive"
    />
    <HeaderOption
      onClick={props.onActionMove}
      tip="Spam"
      enableTip={true}
      icon="icon-not"
      targetName="actionSpam"
    />
    <HeaderOption
      onClick={props.onActionMove}
      tip="Trash"
      enableTip={true}
      icon="icon-trash"
      targetName="actionTrash"
    />
    <HeaderOption
      onClick={props.onMoveClick}
      tip="Move to"
      enableTip={!props.displayMoveMenu}
      icon="icon-file"
      targetName="actionMove"
    />
    <HeaderOption
      onClick={props.onTagsClick}
      tip="Add Labels"
      enableTip={!props.displayTagsMenu}
      icon="icon-tag"
      targetName="actionTag"
    />
  </div>
);

export default StandardOptions;
