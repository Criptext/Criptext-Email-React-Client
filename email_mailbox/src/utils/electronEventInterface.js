import { createEmail } from './electronInterface';
import {
  formEmailLabel,
  formIncomingEmailFromData,
  getRecipientsFromData
} from '../utils/EmailUtils';
import { SocketCommand } from '../utils/const';
import {
  createEmailLabel,
  getEmailByKey,
  LabelType,
  myAccount
} from '../utils/electronInterface';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer } = electron;
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (event, message) => {
  switch (message.cmd) {
    case SocketCommand.NEW_EMAIL: {
      handleNewMessageEvent(message.params);
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

export const handleNewMessageEvent = async emailObj => {
  const InboxLabel = LabelType.inbox;
  const labels = [InboxLabel.id];
  const eventParams = {
    labels
  };

  const prevEmail = await getEmailByKey(emailObj.metadataKey);
  if (!prevEmail.length) {
    const email = await formIncomingEmailFromData(emailObj, myAccount.deviceId);
    const recipients = getRecipientsFromData(emailObj);
    const params = {
      email,
      recipients,
      labels
    };
    await createEmail(params);
  } else {
    const prevEmailId = prevEmail[0].id;
    const emailLabel = formEmailLabel({ emailId: prevEmailId, labels });
    await createEmailLabel(emailLabel);
  }
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
