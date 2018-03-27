import React from 'react';
import PropTypes from 'prop-types';
import './label.css';

const Label = props => (
  <div className="label-tag" style={{ backgroundColor: props.label.color }}>
    <span>{props.label.text}</span>
    <i className="icon-exit" onClick={() => props.onClick(props.label.id)} />
  </div>
);

Label.propTypes = {
  label: PropTypes.object,
  onClick: PropTypes.func
};

export default Label;
