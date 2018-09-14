import React from 'react';
import PropTypes from 'prop-types';
import './emailactions.css';

const EmailActions = props => {
  return (
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
        {props.isSpam || props.isTrash ? (
          <li
            onClick={ev => {
              props.onDeletePermanently(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>Delete permanently</span>
          </li>
        ) : (
          <li
            onClick={ev => {
              props.onDelete(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>Delete</span>
          </li>
        )}

        <li>
          <span>Mark as Unread</span>
        </li>
        {!props.isSpam && (
          <li
            onClick={ev => {
              props.onMarkAsSpam(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>Mark as Spam</span>
          </li>
        )}
      </ul>
    </div>
  );
};

EmailActions.propTypes = {
  isSpam: PropTypes.bool,
  isTrash: PropTypes.bool,
  onDelete: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onForward: PropTypes.func,
  onMarkAsSpam: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onToggleMenu: PropTypes.func
};

export default EmailActions;
