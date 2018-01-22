import React from 'react';
import PropTypes from 'prop-types';
import './label.css';

const Label = props => (
  <div className="label-tag" style={{ backgroundColor: props.color }}>
    <span>{props.text}</span>
    <i className="icon-plus" />
  </div>
);

Label.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string
};

export default Label;
