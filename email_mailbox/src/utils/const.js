/*global process */
import { LabelType } from './electronInterface';
import { currentLanguage } from './../lang';

export const appDomain =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_APPDOMAIN
    : 'criptext.com';

export const avatarBaseUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_AVATAR_URL
    : `https://api.criptext.com/user/avatar/`;

export const unsentText = 'This content was unsent';

export const sidebarItemsOrder = [
  LabelType.inbox.id,
  LabelType.sent.id,
  LabelType.draft.id,
  LabelType.starred.id,
  LabelType.spam.id,
  LabelType.trash.id
];

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
    icon: 'icon-double-checked'
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
  READ: 7
};

export const SocketCommand = {
  NEW_EMAIL: 101,
  EMAIL_TRACKING_UPDATE: 102,
  ATTACHMENT_TRACKING_UPDATE: 103,
  SEND_EMAIL_ERROR: 104,
  NEW_DRAFT: 105,
  EMAIL_MUTED: 106,
  LOW_PREKEYS_AVAILABLE: 107,

  DEVICE_LINK_AUTHORIZATION_REQUEST: 201,
  DEVICE_LINK_AUTHORIZATION_CONFIRMATION: 202,
  KEYBUNDLE_UPLOADED: 203,
  DATA_UPLOADED: 204,
  DEVICE_REMOVED: 205,
  DEVICE_LINK_AUTHORIZATION_DENY: 206,
  DEVICE_LINK_REQUEST_RESPONDED: 207,

  SYNC_DEVICE_REQUEST: 211,
  SYNC_DEVICE_ACCEPT: 212,
  SYNC_DEVICE_REJECT: 216,
  SYNC_DEVICE_REQUEST_RESPONDED: 217,

  PEER_EMAIL_READ_UPDATE: 301,
  PEER_EMAIL_UNSEND: 307,

  PEER_THREAD_READ_UPDATE: 302,
  PEER_EMAIL_LABELS_UPDATE: 303,
  PEER_THREAD_LABELS_UPDATE: 304,
  PEER_EMAIL_DELETED_PERMANENTLY: 305,
  PEER_THREAD_DELETED_PERMANENTLY: 306,
  PEER_LABEL_CREATED: 308,
  PEER_USER_NAME_CHANGED: 309,
  PEER_PASSWORD_CHANGED: 310,
  PEER_RECOVERY_EMAIL_CHANGED: 311,
  PEER_RECOVERY_EMAIL_CONFIRMED: 312,
  PEER_AVATAR_CHANGED: 313,
  PEER_LABEL_UPDATE: 319,
  PEER_LABEL_DELETE: 320,

  NEW_ANNOUNCEMENT: 401,
  UPDATE_AVAILABLE: 402,
  UPDATE_DEVICE_TYPE: 403,

  SEND_OPEN_EVENT: 500,

  SUSPENDED_ACCOUNT_EVENT: 600,
  REACTIVATED_ACCOUNT_EVENT: 601
};

export const NOTIFICATION_ACTIONS = {
  ANTI_PUSH: 'anti_push',
  NEW_EMAIL: 'open_thread',
  OPEN_EMAIL: 'open_activity'
};

export const deviceTypes = {
  PC: 1,
  IOS: 2,
  ANDROID: 3
};

export const usefulLinks = {
  FAQ: `https://criptext.com/${currentLanguage}/faq/`,
  PRIVACY_POLICY: `https://www.criptext.com/${currentLanguage}/privacy`,
  TERMS_OF_SERVICE: `https://www.criptext.com/${currentLanguage}/terms`,
  CRIPTEXT_LIBRARIES: `https://www.criptext.com/${currentLanguage}/open-source-desktop`
};

export const composerEvents = {
  EDIT_DRAFT: 'edit-draft',
  FORWARD: 'forward',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  NEW_WITH_DATA: 'new-with-data'
};

export const formInviteFriendEmailContent = () => {
  return '<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Hey, try Criptext now!</title><style type="text/css">.boton_1{text-decoration: none;padding: 8px;padding-left: 15px;padding-right: 15px;font-family: Avenir Next;font-weight: 500;font-size: 15px;color: #ffffff;background-color: #0091ff;border-radius: 26px;}.boton_1:hover{opacity: 0.9;text-decoration: none;}.boton_2{color: #0091ff}#criptext-website{color: #8FD8FF;text-decoration: none;}#confirm-button{color: #ffffff;}a:active, a:visited{color: #ffffff;}</style></head><body><br/><br/><div style="background-color: #F0F0F0; padding: 6%; max-width: 100%"><div style="background-color:#ffffff; padding-top:60px; padding-bottom: 60px; height:auto; max-width:100%; text-align: center; margin: 0 auto; font-family: avenir next;" ><div style="width: 80%; margin: 0 auto;"><div style="margin: 0 auto;"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/header-icon.png" height="49px" ></div><div style="margin: 0 auto; padding-top:25px "><h2 style="color:#373a45; font-weight: 600; font-size: 23px; text-align: center">Hey, try Criptext now!</h2></div><div style="width: 100%; padding-top:20px "><p style="font-size: 15px; color:#9b9b9b; text-align: center">Criptext is an encrypted email service that guarantees security, privacy and control over all your email communications. We don‘t have access to your emails nor do we store them in our servers. <br/>You‘re in control now.</p></div><div style="margin: 0 auto; padding-top:30px" ><a id="confirm-button" href="http://www.criptext.com/dl" class="boton_1">Download</a></div></div></div><div style="max-width: 100%; margin: 5px auto; background-image: url(https://s3-us-west-2.amazonaws.com/web-res/Emails/footer-background.png); height: 110px; background-position: center top; background-repeat: no-repeat; background-size: auto 200%; font-family: avenir next; text-align: center;"><table style="width: 65%; margin: 0 auto; text-align: left; color: #ffffff; font-size: 13px; padding-top: 35px;"><tr><td style="font-weight: 600;">Encrypted. Private. Simple.<br><a href="https://criptext.com/" target="_blank" id="criptext-website" style="color: #8FD8FF; font-weight: 400;">www.criptext.com</a></td><td><a href="https://twitter.com/Criptext" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/twitter.png" style="height: 18px;"></a></td><td><a href="https://medium.com/criptext" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/medium.png" style="height: 18px;"></a></td><td><a href="https://www.instagram.com/criptext/" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/instagram.png" style="height: 18px;"></a></td></tr></table></div></div></body></html>';
};

export const EXTERNAL_RECIPIENT_ID_SERVER = 'bob';

export const SEND_BUTTON_STATUS = {
  DISABLED: 1,
  ENABLED: 2
};
