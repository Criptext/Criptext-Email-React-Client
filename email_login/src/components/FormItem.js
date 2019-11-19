/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import CustomCheckbox from './CustomCheckbox';
import PropTypes from 'prop-types';
import { mySettings } from '../utils/electronInterface';
import './formitem.scss';

const hasError = props => typeof props.error === 'string' && props.error;
const isValid = props => props.error === undefined;

const formItemType = (formItem, isShowingPassword) => {
  if (formItem.type === 'password' && isShowingPassword) return 'text';

  return formItem.type;
};

const FormItem = props => (
  <div
    className={`form-item ${props.formItem.type} ${
      hasError(props) ? 'hasError' : ''
    }`}
  >
    <div className="validate-icon-section">{renderValidateIcon(props)}</div>
    {renderItem(props)}
  </div>
);

const renderValidateIcon = props => {
  if (props.formItem.type === 'checkbox') return <span className="no-icon" />;

  if (hasError(props)) return <span className="invalid-icon icon-incorret" />;

  if (isValid(props)) return <span className="valid-icon icon-correct" />;

  return <span className="no-icon" />;
};

const renderToSCheckInput = props => (
  <React.Fragment>
    <CustomCheckbox
      value={props.value}
      onChange={ev => props.onChange(ev, props.formItem.name)}
    />
    <span className="label-acceptterms">
      {props.formItem.label.text}
      <a
        href={`https://www.criptext.com/${mySettings.language}/terms`}
        target="_blank"
      >
        <span className="strong">{props.formItem.label.strong}</span>
      </a>
    </span>
  </React.Fragment>
);

const renderTextInput = props => (
  <React.Fragment>
    {renderInput(props)}
    {renderLabel(props.formItem)}
    {renderShowPasswordIcon(props)}
    {renderErrorMessage(props)}
  </React.Fragment>
);

const renderItem = props => (
  <div className="input-data">
    {props.formItem.type === 'checkbox'
      ? renderToSCheckInput(props)
      : renderTextInput(props)}
  </div>
);

const renderInput = props => (
  <input
    className={`input-${props.formItem.name}`}
    name={props.formItem.name}
    type={formItemType(props.formItem, props.isShowingPassword)}
    placeholder={props.formItem.placeholder}
    onChange={ev => props.onChange(ev, props.formItem.name)}
    autoFocus={props.formItem.autoFocus}
  />
);

const renderLabel = formItem =>
  formItem.label.text !== '' ? (
    <label className={`label-${formItem.name}`}>
      {formItem.label.text}
      <strong> {formItem.label.strong}</strong>
    </label>
  ) : null;

const renderShowPasswordIcon = props => {
  const { formItem, isShowingPassword, onToggleShowPassword } = props;
  if (formItem.type !== 'password') return null;

  const icon = isShowingPassword ? 'icon-show' : 'icon-not-show';
  return (
    <span className={`input-icon ${icon}`} onClick={onToggleShowPassword} />
  );
};

const renderErrorMessage = props =>
  hasError(props) ? (
    <span className={`error-message error-${props.formItem.name}`}>
      {props.error}
    </span>
  ) : null;

renderValidateIcon.propTypes = {
  formItem: PropTypes.object
};

renderToSCheckInput.propTypes = {
  formItem: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onChange: PropTypes.func
};

renderItem.propTypes = {
  formItem: PropTypes.object,
  isShowingPassword: PropTypes.bool.isRequired,
  onToggleShowPassword: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onChange: PropTypes.func
};

renderInput.propTypes = {
  formItem: PropTypes.object.isRequired,
  isShowingPassword: PropTypes.object.isShowingPassword,
  onChange: PropTypes.func
};

renderTextInput.propTypes = {
  formItem: PropTypes.object.isRequired
};

renderShowPasswordIcon.propTypes = {
  isShowingPassword: PropTypes.bool.isRequired,
  onToggleShowPassword: PropTypes.func,
  formItem: PropTypes.object.isRequired
};

renderErrorMessage.propTypes = {
  error: PropTypes.string,
  formItem: PropTypes.object
};

FormItem.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.symbol]),
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  formItem: PropTypes.object,
  isShowingPassword: PropTypes.bool.isRequired,
  onToggleShowPassword: PropTypes.func,
  onChange: PropTypes.func
};

export default FormItem;
