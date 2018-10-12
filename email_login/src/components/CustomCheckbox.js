import React from 'react';
import PropTypes from 'prop-types';
import './customCheckbox.scss';

const CustomCheckbox = props => (
  <div className="checkmark-container" onClick={ev => onClick(ev, props)}>
    <span className={'checkmark ' + getClass(props.status)} />
  </div>
);

function getClass(status) {
  if (status) {
    return 'checkmark-checked';
  }
  return '';
}

function onClick(ev, props) {
  ev.stopPropagation();
  ev.preventDefault();
  if (props.status) {
    return props.onCheck(false);
  }
  return props.onCheck(true);
}

// eslint-disable-next-line fp/no-mutation
CustomCheckbox.propTypes = {
  status: PropTypes.bool
};

export default CustomCheckbox;
