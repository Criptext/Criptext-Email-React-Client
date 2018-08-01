import { LabelType } from './electronInterface';

export const appDomain = 'jigl.com';

export const unsentText = '<p>This content was unsent</p>';

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
    icon: 'icon-star-fill'
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
  FAIL: 1,
  UNSEND: 2,
  NONE: 3,
  SENDING: 4,
  SENT: 5,
  DELIVERED: 6,
  OPENED: 7
};

export const SocketCommand = {
  NEW_EMAIL: 101,
  EMAIL_TRACKING_UPDATE: 102,
  ATTACHMENT_TRACKING_UPDATE: 103,
  SEND_EMAIL_ERROR: 104,
  NEW_DRAFT: 105,
  EMAIL_MUTED: 106,

  DEVICE_AUTHORIZATION_REQUEST: 201,
  DEVICE_AUTHORIZATION_CONFIRM: 202,
  KEYBUNDLE_UPLOADED: 203,
  DATA_UPLOADED: 204,

  PEER_EMAIL_READ_UPDATE: 301,
  PEER_EMAIL_UNSEND: 307,

  PEER_THREAD_READ_UPDATE: 302,
  PEER_EMAIL_LABELS_UPDATE: 303,
  PEER_THREAD_LABELS_UPDATE: 304,
  PEER_EMAIL_DELETED_PERMANENTLY: 305,
  PEER_THREAD_DELETED_PERMANENTLY: 306,
  PEER_LABEL_CREATED: 308,
  PEER_USER_NAME_CHANGED: 309
};

export const deviceTypes = {
  PC: 1,
  IOS: 2,
  ANDROID: 3
};

export const usefulLinks = {
  FAQ: 'https://www.criptext.com',
  PRIVACY_POLICIES: 'https://www.criptext.com/privacy',
  TERMS_OF_SERVICE: 'https://www.criptext.com/terms',
  CRIPTEXT_LIBRARIES: 'https://www.criptext.com/open-source-libraries'
};
