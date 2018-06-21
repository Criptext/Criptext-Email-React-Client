import {
  acknowledgeEvents,
  createEmail,
  createEmailLabel,
  getEmailByKey,
  getEmailLabelsByEmailId,
  LabelType,
  getContactByEmails,
  createFeedItem,
  getAccount
} from './electronInterface';
import {
  formEmailLabel,
  formFilesFromData,
  formIncomingEmailFromData,
  getRecipientsFromData
} from './EmailUtils';
import { SocketCommand, appDomain, FeedItemType } from './const';

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
    const files =
      emailObj.files && emailObj.files.length
        ? await formFilesFromData(emailObj.files)
        : null;
    const params = {
      email,
      recipients,
      labels,
      files
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

export const handleEmailTrackingUpdate = async ({ rowid, params }) => {
  const [metadataKey, recipientId] = [params.metadataKey, params.from];
  const [myAccount] = await getAccount();
  if (recipientId !== myAccount.recipientId) {
    const contactEmail = `${recipientId}@${appDomain}`;
    const [contact] = await getContactByEmails([contactEmail]);
    const [email] = await getEmailByKey(metadataKey);
    const feedItemParams = {
      date: params.date,
      type: FeedItemType.OPENED.value,
      emailId: email.id,
      contactId: contact.id
    };
    await createFeedItem([feedItemParams]);
    await acknowledgeEvents([rowid]);
    emitter.emit(Event.EMAIL_TRACKING_UPDATE);
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
  EMAIL_TRACKING_UPDATE: 'email-tracking-update'
};
