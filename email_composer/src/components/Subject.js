import React from 'react';
import PropTypes from 'prop-types';
import './subject.css';

const Subject = props => (
  <div className="subject-container">
    <input
      type="text"
      placeholder="Subject"
      value={props.text}
      onChange={props.onChangeInput}
    />
  </div>
);

Subject.propTypes = {
  onChangeInput: PropTypes.func,
  text: PropTypes.string
};

export default Subject;
