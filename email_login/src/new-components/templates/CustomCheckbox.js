import React from 'react';
import PropTypes from 'prop-types';
import './customCheckbox.scss';

const CustomCheckbox = props => (
  <div className="checkmark-container" onClick={ev => onClick(ev, props)}>
    <span className={'checkmark ' + getClass(props.value)} />
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
  return props.onChange({ target: { value: !props.value } });
}

CustomCheckbox.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func
};

export default CustomCheckbox;
