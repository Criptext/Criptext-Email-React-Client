import React from 'react';
import PropTypes from 'prop-types';
import './label.css';

const Label = props => (
  <span
    className="label-tag"
    style={{ backgroundColor: `#${props.label.color}` }}
  >
    {props.label.text}
    <i
      className="icon-exit"
      onClick={() => props.onClickDelete(props.label.id)}
    />
  </span>
);

Label.propTypes = {
  label: PropTypes.object,
  onClickDelete: PropTypes.func
};

export default Label;
