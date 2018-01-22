import React from 'react';
import PropTypes from 'prop-types';
import './attachitem.css';

const AttachItem = props => (
  <div className="attach-container">
    <div
      className="attach-preview"
      style={{ backgroundImage: `url(${props.image})` }}
    />
    <div className="attach-data">
      <i />
      <span className="attach-data-name">Look at me.pdf</span>
      <span className="attach-data-size">25MB</span>
    </div>
  </div>
);

AttachItem.propTypes = {
  image: PropTypes.string
};

export default AttachItem;
