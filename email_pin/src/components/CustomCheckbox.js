import React from 'react';
import PropTypes from 'prop-types';
import './customcheckbox.scss';

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
  return props.onChange(!props.value);
}

// eslint-disable-next-line fp/no-mutation
CustomCheckbox.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func
};

export default CustomCheckbox;
