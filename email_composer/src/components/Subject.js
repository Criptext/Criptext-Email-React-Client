import React from 'react';
import PropTypes from 'prop-types';
import './subject.scss';

const Subject = props => (
  <div className="subject-container">
    <input
      type="text"
      placeholder="Subject"
      value={props.text}
      onChange={props.onChangeInput}
      onFocus={props.onFocusInput}
    />
  </div>
);

Subject.propTypes = {
  onChangeInput: PropTypes.func,
  onFocusInput: PropTypes.func,
  text: PropTypes.string
};

export default Subject;
