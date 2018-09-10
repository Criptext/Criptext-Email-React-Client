import React from 'react';
import PropTypes from 'prop-types';
import './emptymailbox.css';

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
        header: 'No search results',
        subheader: 'Trash & Spam emails are not displayed',
        iconClass: 'empty-search'
      };
    case 'spam':
      return {
        header: "There's no spam",
        subheader: 'Cool!'
      };
    default:
      return {
        header: "There's no messages",
        subheader: 'Enjoy your day'
      };
  }
};

EmptyMailbox.propTypes = {
  mailbox: PropTypes.string
};

export default EmptyMailbox;
