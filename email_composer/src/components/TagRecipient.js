/*
  eslint jsx-a11y/anchor-is-valid: 0
  jsx-a11y/anchor-has-content: 0
*/
import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from './../utils/const';
import { emailRegex } from './../utils/RegexUtils';
import './tagrecipient.scss';

const TagRecipient = props => {
  const {
    classNameRemove,
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
  const { name, email, complete, state } = getTagDisplayValue(tag);
  const formattedTag =
    !name && !email
      ? { name: tag, email: tag, complete: tag }
      : { name, email, complete, state };
  const isEmailAddressFromAppDomain =
    formattedTag.email.indexOf(`@${appDomain}`) > 0;

  const isValidEmailAddress = emailRegex.test(formattedTag.email);
  checkDisableSendButton(isValidEmailAddress);

  const className = defineClassComponent(
    isValidEmailAddress,
    isEmailAddressFromAppDomain,
    formattedTag.state
  );

  const tagText = formattedTag.state
    ? formattedTag.complete
    : formattedTag.name || formattedTag.email;
  return (
    <span
      key={key}
      className={className}
      {...other}
      onDoubleClick={() => onDoubleClick(type, key)}
    >
      <a>{tagText}</a>
      {!!formattedTag.state && (
        <input
          autoFocus={true}
          onBlur={e => onBlur(e, type, key)}
          onChange={e => onChange(e, type, key)}
          value={tagText}
        />
      )}

      {!disabled && !formattedTag.state && (
        <a className={classNameRemove} onClick={() => onRemove(key)} />
      )}
    </span>
  );
};

const defineClassComponent = (
  isValidEmailAddress,
  isEmailAddressFromAppDomain,
  state
) => {
  let typeTagClass;
  if (!isValidEmailAddress) {
    typeTagClass = 'tag-error';
  } else if (isEmailAddressFromAppDomain) {
    typeTagClass = 'tag-app-domain';
  } else {
    typeTagClass = 'tag-default';
  }
  return `tag-item ${typeTagClass} ${state || ''}`;
};

TagRecipient.propTypes = {
  checkDisableSendButton: PropTypes.func,
  classNameRemove: PropTypes.string,
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
