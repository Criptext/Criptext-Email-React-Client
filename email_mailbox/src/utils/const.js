import { LabelType } from './electronInterface';

export const appDomain = 'criptext.com';

export const SideBarItems = [
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
    icon: 'icon-star',
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

export const FeedActionType = {
  SENT: {
    value: 'sent',
    icon: 'icon-calendar'
  },
  DOWNLOADED: {
    value: 'downloaded',
    icon: 'icon-attach'
  },
  OPENED: {
    value: 'opened',
    icon: 'icon-checked'
  }
};

export const EmailStatus = {
  UNSENT: -1,
  SENT: 0,
  RECEIVED: 1,
  OPENED: 2
};
