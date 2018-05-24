import React from 'react';
import PropTypes from 'prop-types';
import './emptymailbox.css';

const EmptyMailbox = props => {
  const { header, subheader } = defineHeaderAndSubheaderByMailbox(
    props.mailbox
  );
  return (
    <div className="empty-mailbox-container">
      <div className="empty-mailbox-content">
        <div className="empty-icon" />
        <div className="header-text">{header}</div>
        <div className="subheader-text">{subheader}</div>
      </div>
    </div>
  );
};

const defineHeaderAndSubheaderByMailbox = mailbox => {
  switch (mailbox) {
    case 'spam':
      return { header: "There's no spam", subheader: 'Cool!' };
    default:
      return { header: "There's no messages", subheader: 'Enjoy your day' };
  }
};

EmptyMailbox.propTypes = {
  mailbox: PropTypes.string
};

export default EmptyMailbox;
