import {
  acknowledgeEvents,
  createEmail,
  createEmailLabel,
  getEmailByKey,
  getEmailLabelsByEmailId,
  LabelType,
  getContactByEmails,
  createFeedItem,
  myAccount,
  updateOpenedEmailByKey
} from './electronInterface';
import {
  formEmailLabel,
  formFilesFromData,
  formIncomingEmailFromData,
  getRecipientsFromData
} from './EmailUtils';
import { SocketCommand, appDomain, EmailStatus } from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer } = electron;
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (event, message) => {
  switch (message.cmd) {
    case SocketCommand.NEW_EMAIL: {
      handleNewMessageEvent(message);
      return;
    }
    case SocketCommand.EMAIL_TRACKING_UPDATE: {
      handleEmailTrackingUpdate(message);
      return;
    }
    default: {
      alert('Unhandled socket command ', message);
    }
  }
});

ipcRenderer.on('update-drafts', () => {
  emitter.emit(Event.UPDATE_SAVED_DRAFTS);
});

ipcRenderer.on('display-message-email-sent', (ev, { emailId }) => {
  const messageData = {
    ...Messages.success.emailSent,
    type: MessageType.SUCCESS,
    params: { emailId }
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('display-message-success-download', () => {
  const messageData = {
    ...Messages.success.downloadFile,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('display-message-error-download', () => {
  const messageData = {
    ...Messages.error.downloadFile,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('update-thread-emails', (ev, data) => {
  const { threadId, emailId } = data;
  emitter.emit(Event.UPDATE_THREAD_EMAILS, { threadId, emailId });
});

export const handleNewMessageEvent = async ({ rowid, params }) => {
  const [emailObj, eventId] = [params, rowid];
  const InboxLabel = LabelType.inbox;
  const labels = [InboxLabel.id];
  const eventParams = {
    labels
  };
  const [prevEmail] = await getEmailByKey(emailObj.metadataKey);
  if (!prevEmail) {
    const email = await formIncomingEmailFromData(emailObj);
    const recipients = getRecipientsFromData(emailObj);
    const files =
      emailObj.files && emailObj.files.length
        ? await formFilesFromData({
            files: emailObj.files,
            date: emailObj.date
          })
        : null;
    const params = {
      email,
      recipients,
      labels,
      files
    };
    const [newEmail] = await createEmail(params);
    eventParams['threadId'] = emailObj.threadId;
    eventParams['emailId'] = newEmail.id;
  } else {
    const prevEmailId = prevEmail.id;
    eventParams['threadId'] = prevEmail.threadId;
    eventParams['emailId'] = prevEmailId;
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

export const handleEmailTrackingUpdate = async ({ rowid, params }) => {
  const [metadataKey, recipientId] = [params.metadataKey, params.from];
  if (recipientId !== myAccount.recipientId) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      await updateOpenedEmailByKey({
        key: metadataKey,
        status: EmailStatus.READ
      });
      const contactEmail = `${recipientId}@${appDomain}`;
      const [contact] = await getContactByEmails([contactEmail]);
      const feedItemParams = {
        date: params.date,
        type: params.type,
        emailId: email.id,
        contactId: contact.id
      };
      await createFeedItem([feedItemParams]);
      await acknowledgeEvents([rowid]);
      emitter.emit(Event.EMAIL_TRACKING_UPDATE, email.id);
    }
  }
  // To do: Sync this event with my other devices
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = eventName => {
  emitter.removeEvent(eventName);
};

export const Event = {
  NEW_EMAIL: 'new-email',
  UPDATE_SAVED_DRAFTS: 'update-drafts',
  EMAIL_TRACKING_UPDATE: 'email-tracking-update',
  UPDATE_EMAILS: 'update-emails',
  DISPLAY_MESSAGE: 'display-message'
};
