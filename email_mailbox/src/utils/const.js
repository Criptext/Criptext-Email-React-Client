import { LabelType } from './electronInterface';

export const appDomain = 'jigl.com';

export const IconLabels = {
  [LabelType.inbox.id]: {
    icon: 'icon-mailbox'
  },
  [LabelType.sent.id]: {
    icon: 'icon-sent'
  },
  [LabelType.draft.id]: {
    icon: 'icon-doc'
  },
  [LabelType.starred.id]: {
    icon: 'icon-star'
  },
  [LabelType.important.id]: {
    icon: 'icon-tag'
  },
  [LabelType.spam.id]: {
    icon: 'icon-not'
  },
  [LabelType.trash.id]: {
    icon: 'icon-trash'
  },
  allmail: {
    icon: 'icon-mail',
    text: LabelType.allmail.text
  }
};

export const SectionType = {
  MAILBOX: 1,
  THREAD: 2,
  SETTINGS: 3
};

export const FeedItemType = {
  OPENED: {
    value: 1,
    icon: 'icon-checked'
  },
  DOWNLOADED: {
    value: 2,
    icon: 'icon-attach'
  }
};

export const EmailStatus = {
  UNSENT: -1,
  NONE: 0,
  SENT: 1,
  DELIVERED: 2,
  OPENED: 3
};

export const SocketCommand = {
  NEW_EMAIL: 1,
  EMAIL_TRACKING_UPDATE: 2,
  ATTACHMENT_TRACKING_UPDATE: 3,
  NEW_DRAFT: 4,
  EMAIL_READ_UPDATE: 5,
  EMAIL_DELETED: 6,
  EMAIL_LABEL_UPDATE: 7,
  THREAD_LABEL_UPDATE: 8,
  EMAIL_UNSENT: 9,
  EMAIL_MUTED: 10
};

export const FileType = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  PDF: 'pdf',
  OFFICE_DOC: 'word',
  OFFICE_SHEET: 'excel',
  OFFICE_PPT: 'ppt',
  ZIP: 'zip',
  DEFAULT: 'file-default'
};
