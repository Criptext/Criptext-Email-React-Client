import React from 'react';
import PropTypes from 'prop-types';
import './buttonexpand.scss';

const ButtonExpand = props => (
  <div className={'button-expand ' + defineClassButton(props.status)}>
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

const defineClassButton = status => {
  switch (status) {
    case ButtonExpandType.NORMAL:
      return '';
    case ButtonExpandType.OPENED:
      return 'button-expand-opened';
    case ButtonExpandType.UNSENT:
      return 'button-expand-unsend';
    default:
      return '';
  }
};

export const ButtonExpandType = {
  NORMAL: 0,
  OPENED: 1,
  UNSENT: 2
};

ButtonExpand.propTypes = {
  displayPopOver: PropTypes.bool,
  icon: PropTypes.string,
  info: PropTypes.string,
  onTogglePopOver: PropTypes.func,
  renderList: PropTypes.func,
  status: PropTypes.number,
  text: PropTypes.string,
  title: PropTypes.string
};

export default ButtonExpand;
