import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from './../utils/const';
import { emailRegex } from './../utils/RegexUtils';
import './tagrecipient.css';

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
  const isValidEmailAddress = emailRegex.test(tag);
  checkDisableSendButton(isValidEmailAddress);
  const isEmailAddressFromAppDomain = tag.indexOf(`@${appDomain}`) > 0;
  const className = isValidEmailAddress
    ? isEmailAddressFromAppDomain
      ? 'tag-item tag-app-domain'
      : 'tag-item tag-default'
    : 'tag-item tag-error';
  return (
    <span key={key} className={className} {...other}>
      {getTagDisplayValue(tag)}
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
