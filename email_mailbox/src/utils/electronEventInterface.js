import {
  createEmail,
  acknowledgeEvents,
  getEmailLabelsByEmailId
} from './electronInterface';
import {
  formEmailLabel,
  formIncomingEmailFromData,
  getRecipientsFromData
} from '../utils/EmailUtils';
import { SocketCommand } from '../utils/const';
import {
  createEmailLabel,
  getEmailByKey,
  LabelType
} from '../utils/electronInterface';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer } = electron;
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (event, message) => {
  switch (message.cmd) {
    case SocketCommand.NEW_EMAIL: {
      const { rowid, params } = message;
      handleNewMessageEvent({ rowid, params });
      return;
    }
    default: {
      alert('Unhandled socket command ' + message.cmd);
    }
  }
});

ipcRenderer.on('update-drafts', () => {
  emitter.emit(Event.UPDATE_SAVED_DRAFTS);
});

export const handleNewMessageEvent = async ({ rowid, params }) => {
  const [emailObj, eventId] = [params, rowid];
  const InboxLabel = LabelType.inbox;
  const labels = [InboxLabel.id];
  const eventParams = {
    labels
  };

  const prevEmail = await getEmailByKey(emailObj.metadataKey);
  if (!prevEmail.length) {
    const email = await formIncomingEmailFromData(emailObj);
    const recipients = getRecipientsFromData(emailObj);
    const params = {
      email,
      recipients,
      labels
    };
    await createEmail(params);
  } else {
    const prevEmailId = prevEmail[0].id;
    const prevEmailLabels = await getEmailLabelsByEmailId(prevEmailId);
    const prevLabels = prevEmailLabels.map(item => item.labelId);
    if (!prevLabels.includes(LabelType.inbox.id)) {
      const emailLabel = formEmailLabel({ emailId: prevEmailId, labels });
      await createEmailLabel(emailLabel);
    }
  }
  await acknowledgeEvents([eventId]);
  emitter.emit(Event.NEW_EMAIL, eventParams);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = eventName => {
  emitter.removeEvent(eventName);
};

export const Event = {
  NEW_EMAIL: 'new-email',
  UPDATE_SAVED_DRAFTS: 'update-drafts'
};
