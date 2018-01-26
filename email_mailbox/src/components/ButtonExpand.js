import React from 'react';
import PropTypes from 'prop-types';
import './buttonexpand.css';

const ButtonExpand = props => (
  <div className={'button-expand ' + (props.status ? 'email-opened' : '')}>
    <div>
      <i className={props.icon} />
      {props.info ? <span className="info">{props.info}</span> : null}
      <span className="title">{props.title}</span>
      <span className="text">{props.text}</span>
      <i className="icon-arrow-down" onClick={props.onTogglePopOver} />
    </div>
    {props.displayPopOver && props.renderList ? (
      <div className="button-expand-popover">{props.renderList()}</div>
    ) : null}
  </div>
);

ButtonExpand.propTypes = {
  displayPopOver: PropTypes.bool,
  icon: PropTypes.string,
  info: PropTypes.string,
  onTogglePopOver: PropTypes.func,
  renderList: PropTypes.func,
  status: PropTypes.bool,
  text: PropTypes.string,
  title: PropTypes.string
};

export default ButtonExpand;
