import React from 'react';
import PropTypes from 'prop-types';
import { LabelType } from '../utils/electronInterface';
import { toLowerCaseWithoutSpaces } from '../utils/StringUtils';
import string from './../lang';
import './emptymailbox.scss';

const EmptyMailbox = props => {
  const { header, subheader, iconClass } = defineEmptyParamsByMailbox(
    props.mailbox,
    props.status
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

const defineEmptyParamsByMailbox = (mailbox, status) => {
  const { id, text } = mailbox;
  let headerLoading = undefined;
  if (status === EmptyMailboxStatus.LOADING) {
    const mailboxText =
      id >= 1 && id <= 7
        ? LabelType[toLowerCaseWithoutSpaces(text)].text
        : text;
    headerLoading = `${string.mailbox.empty.loading} ${mailboxText}`;
  }

  switch (id) {
    case LabelType.inbox.id: {
      const header = headerLoading || string.mailbox.empty.inbox.header;
      return {
        header,
        subheader: string.mailbox.empty.inbox.subheader,
        iconClass: 'empty-inbox'
      };
    }
    case LabelType.starred.id: {
      const header = headerLoading || string.mailbox.empty.starred.header;
      return {
        header,
        subheader: string.mailbox.empty.starred.subheader,
        iconClass: 'empty-starred'
      };
    }
    case LabelType.trash.id: {
      const header = headerLoading || string.mailbox.empty.trash.header;
      return {
        header,
        subheader: string.mailbox.empty.trash.subheader,
        iconClass: 'empty-trash'
      };
    }
    case LabelType.draft.id: {
      const header = headerLoading || string.mailbox.empty.draft.header;
      return {
        header,
        subheader: string.mailbox.empty.draft.subheader,
        iconClass: 'empty-draft'
      };
    }
    case LabelType.sent.id: {
      const header = headerLoading || string.mailbox.empty.sent.header;
      return {
        header,
        subheader: string.mailbox.empty.sent.subheader,
        iconClass: 'empty-sent'
      };
    }
    case LabelType.spam.id: {
      const header = headerLoading || string.mailbox.empty.spam.header;
      return {
        header,
        subheader: string.mailbox.empty.spam.subheader,
        iconClass: 'empty-spam'
      };
    }
    case LabelType.allmail.id: {
      const header = headerLoading || string.mailbox.empty.allmail.header;
      return {
        header,
        subheader: string.mailbox.empty.allmail.subheader,
        iconClass: 'empty-allmail'
      };
    }
    case LabelType.search.id: {
      const header = headerLoading || string.mailbox.empty.search.header;
      return {
        header,
        subheader: string.mailbox.empty.search.subheader,
        iconClass: 'empty-search'
      };
    }
    default: {
      const header = headerLoading || string.mailbox.empty.default.header;
      return {
        header,
        subheader: string.mailbox.empty.default.subheader,
        iconClass: 'empty-allmail'
      };
    }
  }
};

EmptyMailbox.propTypes = {
  mailbox: PropTypes.object,
  status: PropTypes.number
};

export const EmptyMailboxStatus = {
  LOADING: 0,
  EMPTY: 1
};

export default EmptyMailbox;
