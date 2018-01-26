import React from 'react';
import PropTypes from 'prop-types';
import './attachitem.css';

const AttachItem = props => (
  <div className="attach-container">
    {defineView(props.status, props.image)}
    {props.status !== AttachItemStatus.UNSENT
      ? renderAttachInfo()
      : renderAttachWithoutInfo()}
  </div>
);

const defineView = (status, data) => {
  switch (status) {
    case AttachItemStatus.COMPLETE:
      return attachPreview(data);
    case AttachItemStatus.DOWNLOADED:
      return attachToDownload();
    case AttachItemStatus.UNSENT:
      return attachUnavailable();
    default:
      return null;
  }
};

const attachPreview = props => (
  <div
    className="attach-preview"
    style={{ backgroundImage: `url(${props.data})` }}
  />
);

const attachToDownload = () => (
  <div className="attach-preview attach-download">
    <button className="button-a button-attach-preview">
      <span>preview</span>
    </button>
    <div>
      <i className="icon-download" />
    </div>
  </div>
);

const attachUnavailable = () => (
  <div className="attach-preview attach-unavailable">
    <div />
  </div>
);

const renderAttachInfo = () => (
  <div className="attach-data">
    <div />
    <span className="attach-data-name">Look at me.pdf</span>
    <span className="attach-data-size">25MB</span>
  </div>
);

const renderAttachWithoutInfo = () => (
  <div className="attach-data">
    <div>
      <i className="icon-lock" />
    </div>
    <span className="attach-data-name">Attachment unsent</span>
  </div>
);

export const AttachItemStatus = {
  COMPLETE: 0,
  DOWNLOADED: 1,
  UNSENT: 2
};

attachPreview.propTypes = {
  data: PropTypes.string
};

AttachItem.propTypes = {
  image: PropTypes.string,
  status: PropTypes.number
};

export default AttachItem;
