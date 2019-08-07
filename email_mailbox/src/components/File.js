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
        {renderFileIcon(props.file)}
        <div className="file-content-detail">
          <span className="file-detail-name">{props.file.name}</span>
          <span className="file-detail-size">
            {renderFileDetail(props.file)}
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
    case FileStatus.UNAVAILABLE:
      return 'file-unavailable';
    default:
      return '';
  }
};

const renderFileIcon = ({ status, mimeType }) => {
  const isUnsent = status === UNSENT_FILE_STATUS;
  const filetype = identifyFileType(mimeType);
  return isUnsent ? (
    <div className={`file-content-icon file-content-icon-unsent`}>
      <div className="unsent-icon" />
    </div>
  ) : (
    <div className={`file-content-icon file-content-icon-${filetype}`}>
      <i className={`icon-${filetype}`} />
      <div className="file-icon-status">
        <i className="icon-correct" />
      </div>
    </div>
  );
};

const renderFileDetail = ({ status, size }) => {
  return status === UNSENT_FILE_STATUS ? (
    <b> — </b>
  ) : (
    convertToHumanSize(size, true, 0)
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
    onClick={e => props.onClickCancelDownloadFile(e)}
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
  DOWNLOADED: 'downloaded',
  UNAVAILABLE: 'unavailable'
};

const UNSENT_FILE_STATUS = 0;

File.propTypes = {
  displayProgressBar: PropTypes.bool,
  file: PropTypes.object,
  onDownloadFile: PropTypes.func,
  percentage: PropTypes.number,
  status: PropTypes.string
};

renderFileIcon.propTypes = {
  mimeType: PropTypes.string,
  status: PropTypes.func
};

renderFileDetail.propTypes = {
  status: PropTypes.string,
  size: PropTypes.number
};

renderCancelButton.propTypes = {
  onClickCancelDownloadFile: PropTypes.func
};

export { File as default, FileStatus, UNSENT_FILE_STATUS };
