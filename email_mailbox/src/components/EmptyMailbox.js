import React from 'react';
import PropTypes from 'prop-types';
import { LabelType } from '../utils/electronInterface';
import string from './../lang';
import './emptymailbox.scss';

const EmptyMailbox = props => {
  const { header, subheader, iconClass } = defineEmptyParamsByMailbox(
    props.mailbox,
    props.status,
    props.isUnread
  );
  return (
    <div className={defineClassComponent(props.status)}>
      <div className="empty-content">
        <div className={`empty-icon ${iconClass}`} />
        <div className="header-text">{header}</div>
        {props.status === EmptyMailboxStatus.LOADING ? (
          renderLoading()
        ) : (
          <div className="subheader-text">{subheader}</div>
        )}
      </div>
    </div>
  );
};

const renderLoading = () => (
  <div className="cptx-linear-animate">
    <div className="cptx-indeterminate" />
  </div>
);

const defineClassComponent = status => {
  const statusClass =
    status === EmptyMailboxStatus.LOADING
      ? 'cptx-empty-mailbox-status-loading'
      : '';
  return `empty-container empty-mailbox-container ${statusClass}`;
};

const defineEmptyParamsByMailbox = (mailbox, status, isUnread) => {
  const { id, text } = mailbox;
  let headerLoading = undefined;
  let iconLoading = undefined;
  if (status === EmptyMailboxStatus.LOADING) {
    headerLoading = `${string.mailbox.empty.loading} ${text}`;
    if (id === LabelType.search.id) {
      iconLoading = 'loading-search';
    }
  }

  switch (id) {
    case LabelType.inbox.id: {
      let header = headerLoading || string.mailbox.empty.inbox.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.inbox.subheader,
        iconClass: 'empty-inbox'
      };
    }
    case LabelType.starred.id: {
      let header = headerLoading || string.mailbox.empty.starred.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.starred.subheader,
        iconClass: 'empty-starred'
      };
    }
    case LabelType.trash.id: {
      let header = headerLoading || string.mailbox.empty.trash.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.trash.subheader,
        iconClass: 'empty-trash'
      };
    }
    case LabelType.draft.id: {
      let header = headerLoading || string.mailbox.empty.draft.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.draft.subheader,
        iconClass: 'empty-draft'
      };
    }
    case LabelType.sent.id: {
      let header = headerLoading || string.mailbox.empty.sent.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.sent.subheader,
        iconClass: 'empty-sent'
      };
    }
    case LabelType.spam.id: {
      let header = headerLoading || string.mailbox.empty.spam.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.spam.subheader,
        iconClass: 'empty-spam'
      };
    }
    case LabelType.allmail.id: {
      let header = headerLoading || string.mailbox.empty.allmail.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.allmail.subheader,
        iconClass: 'empty-allmail'
      };
    }
    case LabelType.search.id: {
      let header = headerLoading || string.mailbox.empty.search.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      const iconClass = iconLoading || 'empty-search';
      return {
        header,
        subheader: string.mailbox.empty.search.subheader,
        iconClass
      };
    }
    default: {
      let header = headerLoading || string.mailbox.empty.default.header;
      if (isUnread) header = `${header} (${string.mailbox.unread})`;
      return {
        header,
        subheader: string.mailbox.empty.default.subheader,
        iconClass: 'empty-allmail'
      };
    }
  }
};

EmptyMailbox.propTypes = {
  isUnread: PropTypes.bool,
  mailbox: PropTypes.object,
  status: PropTypes.number
};

export const EmptyMailboxStatus = {
  LOADING: 0,
  EMPTY: 1
};

export default EmptyMailbox;
