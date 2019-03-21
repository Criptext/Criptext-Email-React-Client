import React from 'react';
import PropTypes from 'prop-types';
import './sidebarlabelitem.scss';

const SideBarLabelItem = props => (
  <li className={defineClassComponent(props.selected)}>
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
      <label
        onClick={() => props.onClick()}
        onDoubleClick={() => props.onDoubleClick()}
      >
        {props.text}
      </label>
    )}
  </li>
);

const defineClassComponent = selected => {
  const statusClass = selected ? 'nav-item-selected' : '';
  return `nav-item-label ${statusClass}`;
};

SideBarLabelItem.propTypes = {
  color: PropTypes.string,
  isEditable: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  selected: PropTypes.bool,
  text: PropTypes.string,
  textEditable: PropTypes.string
};

export default SideBarLabelItem;
