import React from 'react';
import PropTypes from 'prop-types';
import './emailactions.css';

const EmailActions = props => (
  <div className="email-more-menu">
    <ul>
      <li
        onClick={ev => {
          props.onReplyEmail(ev);
          props.onToggleMenu(ev);
        }}
      >
        <span>Reply</span>
      </li>
      <li
        onClick={ev => {
          props.onReplyAll(ev);
          props.onToggleMenu(ev);
        }}
      >
        <span>Reply All</span>
      </li>
      <li
        onClick={ev => {
          props.onForward(ev);
          props.onToggleMenu(ev);
        }}
      >
        <span>Forward</span>
      </li>
      <li>
        <span>Delete</span>
      </li>
      <li>
        <span>Mark as Unread</span>
      </li>
      <li>
        <span>Mark as Spam</span>
      </li>
      <li>
        <span>Print</span>
      </li>
    </ul>
  </div>
);

EmailActions.propTypes = {
  onForward: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onToggleMenu: PropTypes.func
};

export default EmailActions;
