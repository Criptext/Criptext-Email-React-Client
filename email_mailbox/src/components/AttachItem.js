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
    case AttachItemStatus.DOWNLOADED:
      return attachPreview(data);
    case AttachItemStatus.UNSENT:
      return attachUnavailable();
    default:
      return null;
  }
};

const attachPreview = props => (
  <div
    className="attach-preview attach-downloaded"
    style={{ backgroundImage: `url(${props.data})` }}
  >
    <div>
      <button className="button-a button-attach-preview">
        <span>preview</span>
      </button>
      <div>
        <i className="icon-download" />
      </div>
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
  DOWNLOADED: 0,
  UNSENT: 1
};

attachPreview.propTypes = {
  data: PropTypes.string
};

AttachItem.propTypes = {
  image: PropTypes.object,
  status: PropTypes.number
};

export default AttachItem;
