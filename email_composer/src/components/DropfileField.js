import React from 'react';
import PropTypes from 'prop-types';
import EditorWrapper from './EditorWrapper';
import AttachmentWrapper from './AttachmentWrapper';
import './dropfilefield.css';

const DropfileField = props => (
  <div
    className={
      'dropfilefiled-container' +
      (props.isDragActive ? ' dragActive' : '') +
      (props.isToolbarHidden ? ' toolbarHidden' : '')
    }
    onDragLeave={props.onDragLeave}
    onDragOver={props.onDragOver}
    onDrop={props.onDrop}
  >
    <EditorWrapper
      htmlBody={props.htmlBody}
      isFocusEditorInput={props.isFocusEditorInput}
      toolbarHidden={props.isToolbarHidden}
      getHtmlBody={props.getHtmlBody}
      onFocusTextEditor={props.onFocusTextEditor}
    />
    <div className="files-container">
      {renderPreview(
        props.files,
        props.onClearFile,
        props.onPauseUploadFile,
        props.onResumeUploadFile
      )}
    </div>
    <input
      type="file"
      accept={props.accept}
      multiple={props.multiple}
      onChange={props.onDrop}
    />
    {props.isDragActive ? (
      <div className="dropfilefiled-content">
        <div />
        <span>Drop files here</span>
      </div>
    ) : null}
  </div>
);

const renderPreview = (
  files,
  onClearFile,
  onPauseUploadFile,
  onResumeUploadFile
) =>
  files.map((file, index) => {
    return (
      <AttachmentWrapper
        key={index}
        file={file}
        onClearFile={onClearFile}
        onPauseUploadFile={onPauseUploadFile}
        onResumeUploadFile={onResumeUploadFile}
      />
    );
  });

DropfileField.defaultProps = {
  accept: '',
  multiple: true
};

DropfileField.propTypes = {
  accept: PropTypes.string,
  addFiletoken: PropTypes.func,
  files: PropTypes.array,
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.string,
  isDragActive: PropTypes.bool,
  isFocusEditorInput: PropTypes.bool,
  isToolbarHidden: PropTypes.bool,
  multiple: PropTypes.bool,
  onClearFile: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  onFocusTextEditor: PropTypes.func,
  onPauseUploadFile: PropTypes.func,
  onResumeUploadFile: PropTypes.func
};

export default DropfileField;
