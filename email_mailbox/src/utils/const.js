export const LabelType = {
  inbox: {
    id: 1,
    text: 'Inbox'
  },
  spam: {
    id: 2,
    text: 'Spam'
  },
  sent: {
    id: 3,
    text: 'Sent'
  },
  important: {
    id: 4,
    text: 'Important'
  },
  starred: {
    id: 5,
    text: 'Starred'
  },
  draft: {
    id: null,
    text: 'Draft'
  },
  trash: {
    id: null,
    text: 'Trash'
  },
  search: {
    id: null,
    text: 'Search'
  }
};

export const MailItems = [
  {
    id: 'inbox',
    icon: 'icon-mailbox',
    text: LabelType.inbox.text
  },
  {
    id: 'sent',
    icon: 'icon-sent',
    text: LabelType.sent.text
  },
  {
    id: 'draft',
    icon: 'icon-doc',
    text: 'Draft'
  },
  {
    id: 'starred',
    icon: 'icon-start',
    text: LabelType.starred.text
  },
  {
    id: 'spam',
    icon: 'icon-not',
    text: LabelType.spam.text
  },
  {
    id: 'trash',
    icon: 'icon-trash',
    text: 'Trash'
  }
];

export const FeedCommand = {
  SENT: {
    value: 1,
    icon: 'icon-calendar'
  },
  EXPIRED: {
    value: 2,
    icon: 'icon-attach'
  },
  OPENED: {
    value: 3,
    icon: 'icon-checked'
  }
};

export const EmailStatus = {
  UNSENT: -1,
  SENT: 0,
  RECEIVED: 1,
  OPENED: 2
};
