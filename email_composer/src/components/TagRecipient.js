import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from './../utils/const';
import './tagrecipient.css';

const TagRecipient = props => {
  const {
    tag,
    key,
    disabled,
    onRemove,
    classNameRemove,
    getTagDisplayValue,
    ...other
  } = props;
  const isEmailAddressFromAppDomain = tag.indexOf(`@${appDomain}`) > 0;
  const className = isEmailAddressFromAppDomain
    ? 'tag-item tag-app-domain'
    : 'tag-item tag-default';
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
  classNameRemove: PropTypes.string,
  disabled: PropTypes.bool,
  getTagDisplayValue: PropTypes.func,
  key: PropTypes.string,
  onRemove: PropTypes.func,
  tag: PropTypes.string
};

export default TagRecipient;
