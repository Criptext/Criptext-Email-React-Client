import React from 'react';
import PropTypes from 'prop-types';
import { convertToHumanSize } from './../utils/StringUtils';
import { FileType } from './../utils/const';
import './file.css';

const File = props => {
  return (
    <div className="file-container">
      {renderFileIcon(props.file.type)}
      <div className="file-content-detail">
        <span className="file-detail-name">{props.file.name}</span>
        <span className="file-detail-size">
          {convertToHumanSize(props.file.size, true)}
        </span>
      </div>
      <button>
        <i className="icon-download" />
      </button>
    </div>
  );
};

const renderFileIcon = type => {
  const filetype = type || FileType.DEFAULT;
  return (
    <div className="file-content-icon">
      <div className={`icon-container-${filetype}`}>
        <i className={`icon-${filetype}`} />
      </div>
    </div>
  );
};

File.propTypes = {
  file: PropTypes.object
};

export default File;
