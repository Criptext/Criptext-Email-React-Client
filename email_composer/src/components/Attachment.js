import React from 'react';
import PropTypes from 'prop-types';
import { convertToHumanSize } from './../utils/StringUtils';
import { FILE_TYPES, identifyFileType } from './../utils/FileUtils';
import './attachment.css';

const Attachment = props => {
  return (
    <div
      className={`file-container ${props.isLoading ? 'container-loading' : ''}`}
    >
      <div className="file-icon">{renderFileIcon(props.file.type)}</div>
      <div className="file-info">
        <span>{props.file.name}</span>
        <span>{convertToHumanSize(props.file.size, true)}</span>
      </div>
      <div
        className="file-delete"
        onClick={() => props.onClearFile(props.file.name)}
      >
        <i className="icon-exit" />
      </div>
      {props.isLoading ? <div className="loading-file-bar" /> : null}
    </div>
  );
};

const renderFileIcon = type => {
  const filetype = identifyFileType(type);
  switch (filetype) {
    case FILE_TYPES.IMAGE:
      return (
        <span className="icon-container-image">
          <span className="icon-image" />
        </span>
      );
    case FILE_TYPES.PDF:
      return (
        <span className="icon-container-pdf">
          <span className="icon-pdf" />
        </span>
      );
    case FILE_TYPES.ZIP:
      return (
        <span className="icon-container-zip">
          <span className="icon-zip" />
        </span>
      );
    case FILE_TYPES.AUDIO:
      return (
        <span className="icon-container-audio">
          <span className="icon-audio" />
        </span>
      );
    case FILE_TYPES.OFFICE_PPT:
      return (
        <span className="icon-container-ppt">
          <span className="icon-ppt" />
        </span>
      );
    case FILE_TYPES.OFFICE_DOC:
      return (
        <span className="icon-container-word">
          <span className="icon-word" />
        </span>
      );
    case FILE_TYPES.OFFICE_SHEET:
      return (
        <span className="icon-container-excel">
          <span className="icon-excel" />
        </span>
      );
    case FILE_TYPES.VIDEO:
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

Attachment.propTypes = {
  isLoading: PropTypes.bool,
  file: PropTypes.object,
  onClearFile: PropTypes.func
};

export default Attachment;
