import React from 'react';
import PropTypes from 'prop-types';
import './sidebarlabelitem.css';

const SideBarLabelItem = props => (
  <li className="nav-item-label">
    <div style={{ backgroundColor: props.color }} />
    {props.isEditable ? (
      <input
        autoFocus={true}
        type="text"
        onBlur={props.onBlur}
        onChange={props.onChange}
        onKeyPress={props.onKeyPress}
        value={props.textEditable}
      />
    ) : (
      <label onDoubleClick={props.onDoubleClick}>{props.text}</label>
    )}
  </li>
);

SideBarLabelItem.propTypes = {
  color: PropTypes.string,
  isEditable: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  text: PropTypes.string,
  textEditable: PropTypes.string
};

export default SideBarLabelItem;
