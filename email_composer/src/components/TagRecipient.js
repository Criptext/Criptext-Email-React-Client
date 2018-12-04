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
    tag,
    key,
    disabled,
    onRemove,
    classNameRemove,
    getTagDisplayValue,
    checkDisableSendButton,
    ...other
  } = props;

  const { name, email } = getTagDisplayValue(tag);
  const formattedTag =
    !name && !email ? { name: tag, email: tag } : { name, email };

  const isEmailAddressFromAppDomain =
    formattedTag.email.indexOf(`@${appDomain}`) > 0;

  const isValidEmailAddress = emailRegex.test(formattedTag.email);
  checkDisableSendButton(isValidEmailAddress);

  const className = isValidEmailAddress
    ? isEmailAddressFromAppDomain
      ? 'tag-item tag-app-domain'
      : 'tag-item tag-default'
    : 'tag-item tag-error';
  return (
    <span key={key} className={className} {...other}>
      {formattedTag.name || formattedTag.email}
      {!disabled && (
        <a className={classNameRemove} onClick={() => onRemove(key)} />
      )}
    </span>
  );
};

TagRecipient.propTypes = {
  checkDisableSendButton: PropTypes.func,
  classNameRemove: PropTypes.string,
  disabled: PropTypes.bool,
  getTagDisplayValue: PropTypes.func,
  key: PropTypes.string,
  onRemove: PropTypes.func,
  tag: PropTypes.string
};

export default TagRecipient;
