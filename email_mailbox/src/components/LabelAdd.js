import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './labeladd.scss';

const LabelAdd = props => (
  <li className="nav-item-label nav-item-label-add">
    <div>
      <i className="icon-plus" />
    </div>
    {props.isHiddenAddLabel ? (
      <span onClick={e => props.onClick(e)}>{string.sidebar.new_label}</span>
    ) : (
      <input
        className="input-a"
        type="text"
        placeholder={string.sidebar.enter_new_label}
        autoFocus={true}
        value={props.labelToAdd}
        onBlur={e => props.onBlur(e)}
        onChange={e => props.onChange(e)}
        onKeyPress={e => props.onKeyPress(e)}
      />
    )}
  </li>
);

LabelAdd.propTypes = {
  isHiddenAddLabel: PropTypes.bool,
  labelToAdd: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onKeyPress: PropTypes.func
};

export default LabelAdd;
