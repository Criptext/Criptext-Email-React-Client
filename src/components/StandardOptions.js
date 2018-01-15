import React from 'react';
import HeaderActionTooltip from './HeaderActionTooltip';

const StandardOptions = props => (
  <div className="header-action">
    <div onClick={props.onActionMove} data-tip data-for="actionArchive">
      <i className="icon-archive" />
      <HeaderActionTooltip target="actionArchive" tip="Archive" />
    </div>
    <div onClick={props.onActionMove} data-tip data-for="actionSpam">
      <i className="icon-not" />
      <HeaderActionTooltip target="actionSpam" tip="Spam" />
    </div>
    <div onClick={props.onActionMove} data-tip data-for="actionTrash">
      <i className="icon-trash" />
      <HeaderActionTooltip target="actionTrash" tip="Trash" />
    </div>
    <div
      id="actionMove"
      onClick={props.onMoveClick}
      data-tip
      data-for="actionMove"
    >
      <i className="icon-file" />
      {props.displayMoveMenu ? null : (
        <HeaderActionTooltip target="actionMove" tip="Move to" />
      )}
    </div>
    <div
      id="actionTag"
      onClick={props.onTagsClick}
      data-tip
      data-for="actionTag"
    >
      <i className="icon-tag" />
      {props.displayTagsMenu ? null : (
        <HeaderActionTooltip target="actionTag" tip="Add Labels" />
      )}
    </div>
  </div>
);

export default StandardOptions;
