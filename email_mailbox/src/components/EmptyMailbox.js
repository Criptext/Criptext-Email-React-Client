import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './emptymailbox.scss';

const EmptyMailbox = props => {
  const { header, subheader, iconClass } = defineEmptyParamsByMailbox(
    props.mailbox
  );
  return (
    <div className="empty-mailbox-container">
      <div className="empty-mailbox-content">
        <div className={`empty-icon ${iconClass || 'empty-mailbox'}`} />
        <div className="header-text">{header}</div>
        <div className="subheader-text">{subheader}</div>
      </div>
    </div>
  );
};

const defineEmptyParamsByMailbox = mailbox => {
  switch (mailbox) {
    case 'search':
      return {
        header: string.mailbox.empty.search.header,
        subheader: string.mailbox.empty.search.subheader,
        iconClass: 'empty-search'
      };
    case 'spam':
      return {
        header: string.mailbox.empty.spam.header,
        subheader: string.mailbox.empty.spam.subheader
      };
    default:
      return {
        header: string.mailbox.empty.default.header,
        subheader: string.mailbox.empty.default.subheader
      };
  }
};

EmptyMailbox.propTypes = {
  mailbox: PropTypes.string
};

export default EmptyMailbox;
