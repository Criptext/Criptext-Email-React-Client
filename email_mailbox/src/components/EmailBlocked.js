import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const EmailBlocked = props => {
  return (
    <div className="email-more-menu">
      <ul>
        <li
          onClick={ev => {
            props.onBlockImagesInline(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.once}</span>
        </li>
        <li
          onClick={ev => {
            props.onBlockImagesContact(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.contact}</span>
        </li>
        <li
          onClick={ev => {
            props.onBlockImagesAccount(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.total}</span>
        </li>
      </ul>
    </div>
  );
};

EmailBlocked.propTypes = {
  onBlockImagesInline: PropTypes.func,
  onBlockImagesContact: PropTypes.func,
  onBlockImagesAccount: PropTypes.func,
  onToggleMenu: PropTypes.func
};

export default EmailBlocked;
