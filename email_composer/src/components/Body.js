import React from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileField';
import Control from './Control';
import './body.scss';

const Body = props => (
  <div className="body-container">
    <DropfileField
      files={props.files}
      getHtmlBody={props.getHtmlBody}
      htmlBody={props.htmlBody}
      isDragActive={props.isDragActive}
      isFocusEditorInput={props.isFocusEditorInput}
      isToolbarHidden={props.isToolbarHidden}
      onClearFile={props.onClearFile}
      onDragLeave={props.handleDragLeave}
      onDragOver={props.handleDragOver}
      onDrop={props.onDrop}
      onFocusTextEditor={props.onFocusTextEditor}
      onPauseUploadFile={props.onPauseUploadFile}
      onResumeUploadFile={props.onResumeUploadFile}
    />
    <Control
      onClickDiscardDraft={props.onClickDiscardDraft}
      onClickTextEditor={props.onClickTextEditor}
      onClickSendMessage={props.onClickSendMessage}
      status={props.status}
      onDrop={props.onDrop}
    />
  </div>
);

Body.propTypes = {
  addFiletoken: PropTypes.func,
  files: PropTypes.array,
  getHtmlBody: PropTypes.func,
  handleDragLeave: PropTypes.func,
  handleDragOver: PropTypes.func,
  htmlBody: PropTypes.string,
  isDragActive: PropTypes.bool,
  isFocusEditorInput: PropTypes.bool,
  isToolbarHidden: PropTypes.bool,
  onClearFile: PropTypes.func,
  onClickDiscardDraft: PropTypes.func,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func,
  onDrop: PropTypes.func,
  onFocusTextEditor: PropTypes.func,
  onPauseUploadFile: PropTypes.func,
  onResumeUploadFile: PropTypes.func,
  status: PropTypes.number
};

export default Body;
