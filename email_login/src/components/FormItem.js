import React from 'react';
import CustomCheckbox from './CustomCheckbox';
import PropTypes from 'prop-types';
import './signup.css';

const FormItem = props => renderFormItem(props);

const renderFormItem = props => (
  <div className={'form-item ' + (props.hasError ? 'hasError' : '')}>
    <div className="validate-icon-section">{renderValidateIcon(props)}</div>
    {renderItem(props)}
    <div className="clear-item" />
  </div>
);

const renderValidateIcon = props =>
  props.validated ? (
    props.formItem.type !== 'checkbox' ? (
      props.hasError ? (
        <span className="invalid-icon icon-check" />
      ) : (
        <span className="valid-icon icon-check" />
      )
    ) : (
      <span className="no-icon" />
    )
  ) : (
    <span className="no-icon" />
  );

const renderItem = props =>
  props.formItem.type !== 'checkbox' ? (
    <div className="input-data">
      {renderInput(props.formItem)}
      {renderLabel(props.formItem)}
      {renderIcon(props.formItem)}
      {renderErrorMessage(props)}
    </div>
  ) : (
    <CustomCheckbox
      label={props.formItem.label.text}
      strong={props.formItem.label.strong}
      status={props.isChecked}
      onCheck={() => props.onCheck()}
    />
  );

const renderInput = formItem => (
  <input
    className={`input-${formItem.name}`}
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

const renderIcon = formItem =>
  formItem.icon !== '' ? <span className="input-icon icon-search" /> : null;

const renderErrorMessage = props =>
  props.hasError ? (
    <span className={`error-message error-${props.formItem.name}`}>
      {props.formItem.errorMessage}
    </span>
  ) : null;

renderFormItem.propTypes = {
  hasError: PropTypes.bool
};

renderValidateIcon.propTypes = {
  validated: PropTypes.bool,
  formItem: PropTypes.object,
  hasError: PropTypes.bool
};

renderItem.propTypes = {
  formItem: PropTypes.object,
  isChecked: PropTypes.bool,
  onCheck: PropTypes.func
};

renderErrorMessage.propTypes = {
  hasError: PropTypes.bool,
  formItem: PropTypes.object
};

export default FormItem;
