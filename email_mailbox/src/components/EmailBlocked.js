import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const EmailBlocked = props => {
  return (
    <div className="email-more-menu">
      <ul>
        <li
          onClick={ev => {
            props.onReplyEmail(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>Once</span>
        </li>
        <li
          onClick={ev => {
            props.onReplyAll(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>Always from this sender</span>
        </li>
        <li
          onClick={ev => {
            props.onForward(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>Turn off image blocking</span>
        </li>
      </ul>
    </div>
  );
};

export default EmailBlocked;
