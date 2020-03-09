import React from 'react';
import PropTypes from 'prop-types';
import './sidebaritem.scss';

const SideBarItem = props => (
  <li
    className={props.selected ? 'nav-item nav-item-selected' : 'nav-item'}
    onClick={props.onClick}
  >
    <div className="nav-item-icon">
      <i className={props.item.icon} />
    </div>
    <span>{props.item.text}</span>
    {props.item.badge ? (
      <div className="nav-item-badge">
        <span className="badge">
          {props.item.badge > 100 ? '99+' : props.item.badge}
        </span>
      </div>
    ) : null}
  </li>
);

SideBarItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

export default SideBarItem;
