import React from 'react';
import PropTypes from 'prop-types';
import Editor from './EditorWrapper';
import './dropfilefield.css';
import { convertToHumanSize } from './../utils/StringUtils';

const DropfileField = props => (
  <div
    className={
      'dropfilefiled-container ' + (props.isDragActive ? 'dragActive' : '')
    }
    onDragLeave={props.onDragLeave}
    onDragOver={props.onDragOver}
    onDrop={props.onDrop}
  >
    <Editor
      htmlBody={props.htmlBody}
      toolbarHidden={props.isToolbarHidden}
      getHtmlBody={props.getHtmlBody}
      blockRenderMap={props.blockRenderMap}
    />
    <div className="files-container">
      {renderPreview(props.files, props.onClearFile)}
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

const renderPreview = (files, onClearFile) =>
  files.map((file, index) => {
    return (
      <div key={index} className="file-container">
        <div className="file-icon">{renderFileIcon(file.type)}</div>
        <div className="file-info">
          <span>{file.name}</span>
          <span>{convertToHumanSize(file.size, true)}</span>
        </div>
        <div className="file-delete" onClick={() => onClearFile(file.name)}>
          <i className="icon-exit" />
        </div>
      </div>
    );
  });

const renderFileIcon = type => {
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      return (
        <span className="icon-container-image">
          <span className="icon-image" />
        </span>
      );
    case 'application/pdf':
      return (
        <span className="icon-container-pdf">
          <span className="icon-pdf" />
        </span>
      );
    case 'application/zip':
      return (
        <span className="icon-container-zip">
          <span className="icon-zip" />
        </span>
      );
    case 'audio/mp3':
      return (
        <span className="icon-container-audio">
          <span className="icon-audio" />
        </span>
      );
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return (
        <span className="icon-container-ppt">
          <span className="icon-ppt" />
        </span>
      );
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return (
        <span className="icon-container-word">
          <span className="icon-word" />
        </span>
      );
    case 'text/csv':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return (
        <span className="icon-container-excel">
          <span className="icon-excel" />
        </span>
      );
    case 'video/mpeg':
    case 'video/mp4':
      return (
        <span className="icon-container-video">
          <span className="icon-video" />
        </span>
      );
    default:
      return (
        <span className="icon-container-default">
          <span className="icon-file-default" />
        </span>
      );
  }
};

DropfileField.defaultProps = {
  accept: '',
  multiple: true
};

DropfileField.propTypes = {
  accept: PropTypes.string,
  blockRenderMap: PropTypes.object,
  files: PropTypes.array,
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  isDragActive: PropTypes.bool,
  isToolbarHidden: PropTypes.bool,
  multiple: PropTypes.bool,
  onClearFile: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func
};

export default DropfileField;
