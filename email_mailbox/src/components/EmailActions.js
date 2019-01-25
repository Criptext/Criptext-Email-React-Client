import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './emailactions.scss';

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
          <span>{string.mailbox.reply}</span>
        </li>
        <li
          onClick={ev => {
            props.onReplyAll(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.reply_all}</span>
        </li>
        <li
          onClick={ev => {
            props.onForward(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.forward}</span>
        </li>
        {props.isSpam || props.isTrash ? (
          <li
            onClick={ev => {
              props.onDeletePermanently(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>{string.mailbox.delete_permanently}</span>
          </li>
        ) : (
          <li
            onClick={ev => {
              props.onDelete(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>{string.mailbox.delete}</span>
          </li>
        )}

        <li>
          <span>{string.mailbox.mark_as_unread}</span>
        </li>
        {!props.isSpam && (
          <li
            onClick={ev => {
              props.onMarkAsSpam(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>{string.mailbox.mark_as_spam}</span>
          </li>
        )}
        <li
          onClick={ev => {
            props.onPrintEmail(ev);
            props.onToggleMenu(ev);
          }}
        >
          <span>{string.mailbox.print_email}</span>
        </li>
        {props.hasBoundary && (
          <li
            onClick={ev => {
              props.onOpenEmailSource(ev);
              props.onToggleMenu(ev);
            }}
          >
            <span>{string.mailbox.email_source}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

EmailActions.propTypes = {
  isSpam: PropTypes.bool,
  isTrash: PropTypes.bool,
  hasBoundary: PropTypes.bool,
  onDelete: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onForward: PropTypes.func,
  onMarkAsSpam: PropTypes.func,
  onOpenEmailSource: PropTypes.func,
  onPrintEmail: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onToggleMenu: PropTypes.func
};

export default EmailActions;
