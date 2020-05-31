import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const EmailBlocked = props => {
  return (
    <div className="email-more-menu">
      <ul>
        {renderShowOnce(props)}
        {renderShowContact(props)}
        {renderShowAccount(props)}
      </ul>
    </div>
  );
};

const renderShowOnce = props => {
  if (props.blockImagesInline) {
    return (
      <div>
        <li
          onClick={ev => {
            props.onBlockImagesInline(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.once}</span>
        </li>
      </div>
    );
  }
};

const renderShowContact = props => {
  if (props.blockImagesContact) {
    return (
      <div>
        <li
          onClick={ev => {
            props.onBlockImagesContact(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.contact}</span>
        </li>
      </div>
    );
  }
};

const renderShowAccount = props => {
  if (props.blockImagesAccount) {
    return (
      <div>
        <li
          onClick={ev => {
            props.onBlockImagesAccount(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.blocked.total}</span>
        </li>
      </div>
    );
  }
};

EmailBlocked.propTypes = {
  onBlockImagesInline: PropTypes.func,
  onBlockImagesContact: PropTypes.func,
  onBlockImagesAccount: PropTypes.func,
  onToggleMenu: PropTypes.func
};

export default EmailBlocked;
