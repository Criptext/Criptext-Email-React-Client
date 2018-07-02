import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { convertToHumanSize } from './../utils/StringUtils';
import { FileType } from './../utils/const';
import './file.css';

const File = props => {
  return (
    <div
      id={props.file.token}
      className="file-container"
      data-tip=""
      data-for={props.file.token}
    >
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
