/* eslint react/jsx-no-target-blank: 0 */
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

const renderValidateIcon = props => {
  if (!props.validated || props.formItem.type === 'checkbox') {
    return <span className="no-icon" />;
  }
  if (props.hasError) {
    return <span className="invalid-icon icon-incorret" />;
  }
  return <span className="valid-icon icon-correct" />;
};

const renderItem = props =>
  props.formItem.type !== 'checkbox' ? (
    <div className="input-data">
      {renderInput(props)}
      {renderLabel(props.formItem)}
      {renderIcon(props)}
      {renderErrorMessage(props)}
    </div>
  ) : (
    <div className="input-data">
      <CustomCheckbox status={props.isChecked} onCheck={() => onCheck(props)} />
      <span className="label-acceptterms">
        {props.formItem.label.text}
        <a href="https://www.criptext.com/terms" target="_blank">
          <span className="strong">{props.formItem.label.strong}</span>
        </a>
      </span>
    </div>
  );

const onCheck = props => {
  props.onCheck();
  const ev = { target: { value: !props.isChecked } };
  props.onChange(ev, props.formItem.name);
};

const renderInput = props => (
  <input
    className={`input-${props.formItem.name}`}
    name={props.formItem.name}
    type={props.type}
    placeholder={props.formItem.placeholder}
    onChange={ev => props.onChange(ev, props.formItem.name)}
    onKeyUp={props.onValidate}
  />
);

const renderLabel = formItem =>
  formItem.label.text !== '' ? (
    <label className={`label-${formItem.name}`}>
      {formItem.label.text}
      <strong> {formItem.label.strong}</strong>
    </label>
  ) : null;

const renderIcon = props =>
  props.formItem.icon !== '' ? (
    <span className={`input-icon ${props.icon}`} onClick={props.onShowHide} />
  ) : null;

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
  isChecked: PropTypes.bool
};

onCheck.propTypes = {
  onCheck: PropTypes.func,
  isChecked: PropTypes.bool
};

renderInput.propTypes = {
  formItem: PropTypes.object,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onCheck: PropTypes.func,
  onValidate: PropTypes.func
};

renderIcon.propTypes = {
  formItem: PropTypes.object,
  icon: PropTypes.string,
  onShowHide: PropTypes.func
};

renderErrorMessage.propTypes = {
  hasError: PropTypes.bool,
  formItem: PropTypes.object
};

export default FormItem;
