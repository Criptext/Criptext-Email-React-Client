import React from 'react';
import PropTypes from 'prop-types';
import { LabelType } from '../utils/electronInterface';
import string from './../lang';
import './emptymailbox.scss';

const EmptyMailbox = props => {
  const { header, subheader, iconClass } = defineEmptyParamsByMailbox(
    props.mailbox
  );
  return (
    <div className="empty-container empty-mailbox-container">
      <div className="empty-content">
        <div className={`empty-icon ${iconClass}`} />
        <div className="header-text">{header}</div>
        <div className="subheader-text">{subheader}</div>
      </div>
    </div>
  );
};

const defineEmptyParamsByMailbox = ({ id, text }) => {
  switch (id) {
    case LabelType.inbox.id:
      return {
        header: string.mailbox.empty.inbox.header,
        subheader: string.mailbox.empty.inbox.subheader,
        iconClass: 'empty-inbox'
      };
    case LabelType.starred.id:
      return {
        header: string.mailbox.empty.starred.header,
        subheader: string.mailbox.empty.starred.subheader,
        iconClass: 'empty-starred'
      };
    case LabelType.trash.id:
      return {
        header: string.mailbox.empty.trash.header,
        subheader: string.mailbox.empty.trash.subheader,
        iconClass: 'empty-trash'
      };
    case LabelType.draft.id:
      return {
        header: string.mailbox.empty.draft.header,
        subheader: string.mailbox.empty.draft.subheader,
        iconClass: 'empty-draft'
      };
    case LabelType.sent.id:
      return {
        header: string.mailbox.empty.sent.header,
        subheader: string.mailbox.empty.sent.subheader,
        iconClass: 'empty-sent'
      };
    case LabelType.spam.id:
      return {
        header: string.mailbox.empty.spam.header,
        subheader: string.mailbox.empty.spam.subheader,
        iconClass: 'empty-spam'
      };
    default: {
      switch (text) {
        case 'Buscar':
        case 'Search':
          return {
            header: string.mailbox.empty.search.header,
            subheader: string.mailbox.empty.search.subheader,
            iconClass: 'empty-search'
          };
        case 'All Mail':
        case 'Todos':
          return {
            header: string.mailbox.empty.allmail.header,
            subheader: string.mailbox.empty.allmail.subheader,
            iconClass: 'empty-allmail'
          };
        default:
          return {
            header: string.mailbox.empty.default.header,
            subheader: string.mailbox.empty.default.subheader,
            iconClass: 'default-empty-mailbox'
          };
      }
    }
  }
};

EmptyMailbox.propTypes = {
  mailbox: PropTypes.object
};

export default EmptyMailbox;
