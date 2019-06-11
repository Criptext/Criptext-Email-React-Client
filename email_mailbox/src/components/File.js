import React from 'react';
import PropTypes from 'prop-types';
import { convertToHumanSize } from './../utils/StringUtils';
import { identifyFileType } from './../utils/FileUtils';
import './file.scss';

const File = props => {
  return (
    <div className="file-container">
      <div
        id={props.file.token}
        className={'file-content ' + defineClassFile(props.status)}
        onClick={() => props.onDownloadFile()}
      >
        {renderFileIcon(props.file.mimeType)}
        <div className="file-content-detail">
          <span className="file-detail-name">{props.file.name}</span>
          <span className="file-detail-size">
            {convertToHumanSize(props.file.size, true, 0)}
          </span>
        </div>
        <div className="file-button-container">
          {props.displayProgressBar
            ? renderCancelButton(props)
            : renderDownloadButton(props)}
        </div>
      </div>
      {props.displayProgressBar && renderProgressBar(props.percentage)}
    </div>
  );
};

const defineClassFile = status => {
  switch (status) {
    case FileStatus.NORMAL:
      return '';
    case FileStatus.DOWNLOADING:
      return 'file-loading';
    case FileStatus.FAILED:
      return 'file-failed';
    case FileStatus.PAUSED:
      return 'file-paused';
    case FileStatus.DOWNLOADED:
      return 'file-done';
    default:
      return '';
  }
};

const renderFileIcon = mimeType => {
  const filetype = identifyFileType(mimeType);
  return (
    <div className={`file-content-icon file-content-icon-${filetype}`}>
      <i className={`icon-${filetype}`} />
      <div>
        <i className="icon-correct" />
      </div>
    </div>
  );
};

const renderDownloadButton = () => (
  <button className="file-button-download">
    <i className="icon-download" />
  </button>
);

const renderCancelButton = props => (
  <button
    className="file-button-cancel"
    onClick={() => props.onClickCancelDownloadFile()}
  >
    <i className="icon-exit" />
  </button>
);

const renderProgressBar = percentage => (
  <div
    className="file-bar-loading"
    style={{ width: `calc(${percentage}% - 4px)` }}
  />
);

const FileStatus = {
  NORMAL: 'normal',
  DOWNLOADING: 'downloading',
  FAILED: 'failed',
  PAUSED: 'paused',
  DOWNLOADED: 'downloaded'
};

File.propTypes = {
  displayProgressBar: PropTypes.bool,
  file: PropTypes.object,
  onDownloadFile: PropTypes.func,
  percentage: PropTypes.number,
  status: PropTypes.string
};

renderCancelButton.propTypes = {
  onClickCancelDownloadFile: PropTypes.func
};

export { File as default, FileStatus };
