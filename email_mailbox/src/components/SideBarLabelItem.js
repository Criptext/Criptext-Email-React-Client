import React from 'react';
import PropTypes from 'prop-types';
import './sidebarlabelitem.scss';

const SideBarLabelItem = props => (
  <li
    className={
      props.selected ? 'nav-item-label nav-item-selected' : 'nav-item-label'
    }
  >
    <div style={{ backgroundColor: props.label.color }} />
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
        {props.label.text}
      </label>
    )}
  </li>
);

SideBarLabelItem.propTypes = {
  isEditable: PropTypes.bool,
  label: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  selected: PropTypes.bool,
  textEditable: PropTypes.string
};

export default SideBarLabelItem;
