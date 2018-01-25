import React from 'react';
import PropTypes from 'prop-types';
import './attachitem.css';

const AttachItem = props => (
  <div className="attach-container">
    {props.image.data ? attachPreview(props.image.data) : attachToDownload()}
    <div className="attach-data">
      <i />
      <span className="attach-data-name">Look at me.pdf</span>
      <span className="attach-data-size">25MB</span>
    </div>
  </div>
);

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

attachPreview.propTypes = {
  data: PropTypes.string
};

AttachItem.propTypes = {
  image: PropTypes.string
};

export default AttachItem;
