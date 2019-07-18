/*
  eslint jsx-a11y/anchor-is-valid: 0
  jsx-a11y/anchor-has-content: 0
*/
import React from 'react';
import PropTypes from 'prop-types';
import { emailRegex } from './../utils/RegexUtils';
import './tagrecipient.scss';

const TagRecipient = props => {
  const {
    classNameIconRemove,
    checkDisableSendButton,
    key,
    getTagDisplayValue,
    disabled,
    onBlur,
    onChange,
    onDoubleClick,
    onRemove,
    tag,
    type,
    ...other
  } = props;
  const { name, email, complete, state, form } = getTagDisplayValue(tag);
  const formattedTag =
    !name && !email
      ? { name: tag, email: tag, complete: tag, form: tag }
      : { name, email, complete, state, form };

  const isValidEmailAddress = emailRegex.test(formattedTag.email);
  checkDisableSendButton(isValidEmailAddress);

  const className = defineClassComponent(formattedTag.form, formattedTag.state);
  const isEditable = formattedTag.state === 'tag-expanded';
  const tagText = isEditable
    ? formattedTag.complete
    : formattedTag.name || formattedTag.email;
  const isTagLoading = formattedTag.state === 'tag-loading';
  return (
    <span
      key={key}
      className={className}
      {...other}
      onDoubleClick={isTagLoading ? null : () => onDoubleClick(type, key)}
    >
      <a>{tagText}</a>
      {isEditable && (
        <input
          autoFocus={true}
          onBlur={e => onBlur(e, type, key)}
          onChange={e => onChange(e, type, key)}
          value={tagText}
        />
      )}

      {!disabled && !isEditable && (
        <a className={classNameIconRemove} onClick={() => onRemove(key)} />
      )}
    </span>
  );
};

const defineClassComponent = (form, state) => {
  return `tag-item ${form || 'tag-default'} ${state || ''}`;
};

TagRecipient.propTypes = {
  checkDisableSendButton: PropTypes.func,
  classNameIconRemove: PropTypes.string,
  disabled: PropTypes.bool,
  getTagDisplayValue: PropTypes.func,
  key: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onRemove: PropTypes.func,
  tag: PropTypes.string,
  type: PropTypes.string
};

export default TagRecipient;
