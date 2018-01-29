import React from 'react';
import PropTypes from 'prop-types';
import './signup.css';

const FormItem = props => renderFormItem(props);

const renderFormItem = props => (
  <div className="form-item">
    {renderInput(props.formItem)}
    {renderLabel(props.formItem)}
    <div className="clear-item" />
  </div>
);

const renderInput = formItem => (
  <input
    className={'input-' + formItem.name}
    type={formItem.type}
    placeholder={formItem.placeholder}
  />
);

const renderLabel = formItem =>
  formItem.label.text !== '' ? (
    <label className={'label-' + formItem.name}>
      {formItem.label.text}
      <strong> {formItem.label.strong}</strong>
    </label>
  ) : null;

renderFormItem.propTypes = {
  formItem: PropTypes.object
};

export default FormItem;
