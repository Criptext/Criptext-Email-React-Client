import React from 'react';
import PropTypes from 'prop-types';
import './customCheckbox.css';

const CustomCheckbox = props => (
  <div className="checkmark-container" onClick={ev => onClick(ev, props)}>
    <span className={'checkmark ' + getClass(props.status)} />
    <div>{props.label}</div>
  </div>
);

function getClass(status) {
  if (typeof status === 'boolean') {
    return getClassWhenBoolean(status);
  }
  return getClassWhenString(status);
}

function getClassWhenBoolean(status) {
  if (status) {
    return 'checkmark-checked';
  }
  return '';
}

function getClassWhenString(status) {
  if (status === 'all') {
    return 'checkmark-checked';
  } else if (status === 'partial') {
    return 'checkmark-partial';
  }
  return '';
}

function onClick(ev, props) {
  ev.stopPropagation();
  ev.preventDefault();
  if (typeof props.status === 'boolean') {
    return clickHandlerWhenBoolean(props);
  }
  return clickHandlerWhenString(props);
}

function clickHandlerWhenBoolean(props) {
  if (props.status) {
    return props.onCheck(false);
  }
  return props.onCheck(true);
}

function clickHandlerWhenString(props) {
  if (props.status === 'all') {
    return props.onCheck(false);
  } else if (props.status === 'partial') {
    return props.onCheck(true);
  }
  return props.onCheck(true);
}

CustomCheckbox.propTypes = {
  label: PropTypes.string,
  status: PropTypes.bool
};

export default CustomCheckbox;
