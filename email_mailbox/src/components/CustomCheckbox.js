import React from 'react';
import PropTypes from 'prop-types';
import './customCheckbox.scss';

const CustomCheckbox = props => (
  <div className="checkmark-container" onClick={ev => onClick(ev, props)}>
    <span className={'checkmark ' + getClass(props.status)} />
    {props.label ? <span className="checkmark-text">{props.label}</span> : null}
  </div>
);

function getClass(status) {
  if (status === Status.COMPLETE) {
    return 'checkmark-checked';
  } else if (status === Status.PARTIAL) {
    return 'checkmark-partial';
  }
  return '';
}

function onClick(ev, props) {
  ev.stopPropagation();
  ev.preventDefault();
  if (props.status === Status.COMPLETE) {
    return props.onCheck(Status.NONE);
  } else if (props.status === Status.PARTIAL) {
    return props.onCheck(Status.COMPLETE);
  }
  return props.onCheck(Status.COMPLETE);
}

CustomCheckbox.propTypes = {
  label: PropTypes.string,
  status: PropTypes.string
};

const Status = {
  NONE: 'none',
  PARTIAL: 'partial',
  COMPLETE: 'all',
  toBoolean: status => {
    if (status === Status.NONE || status === Status.PARTIAL) {
      return false;
    }
    return true;
  },
  fromBoolean: bool => {
    if (bool) {
      return Status.COMPLETE;
    }
    return Status.NONE;
  }
};

export default CustomCheckbox;

export const CustomCheckboxStatus = Status;
