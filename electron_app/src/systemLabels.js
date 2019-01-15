const inbox = {
  id: 1,
  text: 'Inbox',
  color: '0091ff',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000001'
};

const spam = {
  id: 2,
  text: 'Spam',
  color: 'ff0000',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000002'
};

const sent = {
  id: 3,
  text: 'Sent',
  color: '1a9759',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000003'
};

const starred = {
  id: 5,
  text: 'Starred',
  color: 'ffce4b',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000005'
};

const draft = {
  id: 6,
  text: 'Draft',
  color: '666666',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000006'
};

const trash = {
  id: 7,
  text: 'Trash',
  color: 'b00e0e',
  type: 'system',
  visible: true,
  uuid: '00000000-0000-0000-0000-000000000007'
};

module.exports = {
  inbox,
  spam,
  sent,
  starred,
  draft,
  trash
};
