/*global process */
export const appDomain =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_APPDOMAIN
    : 'criptext.com';

export const avatarBaseUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_AVATAR_URL
    : `https://api.criptext.com/user/avatar/`;

export const composerEvents = {
  EDIT_DRAFT: 'edit-draft',
  FORWARD: 'forward',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  NEW_WITH_DATA: 'new-with-data'
};

export const defaultEmptyMimetypeValue = 'application/octet-stream';

export const previewLength = 100;
