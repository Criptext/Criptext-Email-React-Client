import { createEmail } from './electronInterface';
import {
  formIncomingEmailFromData,
  getRecipientsFromData
} from '../utils/EmailUtils';
import { SocketCommand } from '../utils/const';
import { LabelType, myAccount } from '../utils/electronInterface';
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

const handleNewMessageEvent = async emailObj => {
  const email = await formIncomingEmailFromData(emailObj, myAccount.deviceId);
  const recipients = getRecipientsFromData(emailObj);
  const InboxLabel = LabelType.inbox;
  const labels = [InboxLabel.id];
  const params = {
    email,
    recipients,
    labels
  };
  await createEmail(params);
  emitter.emit(Event.NEW_EMAIL, params);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = eventName => {
  emitter.removeEvent(eventName);
};

export const Event = {
  NEW_EMAIL: 'new-email'
};
