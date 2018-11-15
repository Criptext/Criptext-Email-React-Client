import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { convertToHumanSize } from './../utils/StringUtils';
import { identifyFileType } from './../utils/FileUtils';
import './file.scss';

const File = props => {
  return (
    <div className="file-container">
      <div
        id={props.file.token}
        className={'file-content ' + defineClassFile(props.status)}
        data-tip=""
        data-for={props.file.token}
      >
        {renderFileIcon(props.file.mimeType)}
        <div className="file-content-detail">
          <span className="file-detail-name">{props.file.name}</span>
          <span className="file-detail-size">
            {convertToHumanSize(props.file.size, true)}
          </span>
        </div>
        {props.displayProgressBar
          ? renderCancelButton(props)
          : renderDownloadButton(props)}
        <ReactTooltip
          place="bottom"
          className="file-tooltip"
          id={props.file.token}
          type="dark"
          effect="solid"
          target={props.file.token}
        >
          {props.file.name}
        </ReactTooltip>
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
    <div className="file-content-icon">
      <div className={`icon-container-${filetype}`}>
        <i className={`icon-${filetype}`} />
      </div>
    </div>
  );
};

const renderDownloadButton = props => (
  <button
    className="file-button-download"
    onClick={() => props.onDownloadFile()}
  >
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
  <div className="file-bar-loading" style={{ width: percentage + '%' }} />
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
  percentage: PropTypes.number,
  status: PropTypes.string
};

renderDownloadButton.propTypes = {
  onDownloadFile: PropTypes.func
};

renderCancelButton.propTypes = {
  onClickCancelDownloadFile: PropTypes.func
};

export { File as default, FileStatus };
