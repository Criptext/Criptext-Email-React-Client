export const openEmptyComposerWindow = () => {};

export const mySettings = { language: 'en' };

export const LabelType = {
  inbox: {
    id: 1,
    text: 'Inbox',
    color: '0091ff'
  },
  spam: {
    id: 2,
    text: 'Spam',
    color: 'ff0000'
  },
  sent: {
    id: 3,
    text: 'Sent',
    color: '1a9759'
  },
  starred: {
    id: 4,
    text: 'Starred',
    color: 'ffdf32'
  },
  draft: {
    id: 5,
    text: 'Draft',
    color: '666666'
  },
  trash: {
    id: 6,
    text: 'Trash',
    color: 'b00e0e'
  },
  search: {
    id: -1,
    text: 'Search',
    color: '000000'
  },
  allmail: {
    id: -1,
    text: 'All Mail',
    color: null
  }
};

export const requiredMinLength = {
  username: 3,
  fullname: 1,
  password: 8
};

export const requiredMaxLength = {
  username: 255,
  fullname: 255,
  password: 255
};
