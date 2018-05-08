import React from 'react';
import PropTypes from 'prop-types';
import { convertToHumanSize } from './../utils/StringUtils';
import { identifyFileType } from './../utils/FileUtils';
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
  return (
    <span className={`icon-container-${filetype}`}>
      <i className={`icon-${filetype}`} />
    </span>
  );
};

Attachment.propTypes = {
  isLoading: PropTypes.bool,
  file: PropTypes.object,
  onClearFile: PropTypes.func
};

export default Attachment;
