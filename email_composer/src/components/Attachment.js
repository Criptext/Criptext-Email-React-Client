import React from 'react';
import PropTypes from 'prop-types';
import { convertToHumanSize } from './../utils/StringUtils';
import { identifyFileType } from './../utils/FileUtils';
import './attachment.scss';

const Attachment = props => {
  return (
    <div className={`file-container ${defineClassFile(props.status)}`}>
      <div className="file-icon">{renderFileIcon(props.file.type)}</div>
      <div className="file-info">
        <span>{props.file.name}</span>
        <span>{convertToHumanSize(props.file.size, true, 0)}</span>
      </div>
      <div className="file-delete" onClick={() => props.onRemove()}>
        <i className="icon-exit" />
      </div>
      {props.status === FileStatus.UPLOADING && (
        <div
          className="file-loading-bar"
          style={{ width: props.percentage + '%' }}
        />
      )}
    </div>
  );
};

const defineClassFile = status => {
  switch (status) {
    case FileStatus.UPLOADING:
      return 'file-uploading';
    case FileStatus.PAUSED:
      return 'file-paused';
    case FileStatus.UPLOADED:
      return 'file-uploaded';
    case FileStatus.FAILED:
      return 'file-failed';
    default:
      return '';
  }
};

const renderFileIcon = type => {
  const filetype = identifyFileType(type);
  return (
    <span className={`icon-container-${filetype}`}>
      <i className={`icon-${filetype}`} />
    </span>
  );
};

const FileStatus = {
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  UPLOADED: 'uploaded',
  FAILED: 'failed'
};

Attachment.propTypes = {
  file: PropTypes.object,
  onRemove: PropTypes.func,
  percentage: PropTypes.number,
  status: PropTypes.string
};

export { Attachment as default, FileStatus };
