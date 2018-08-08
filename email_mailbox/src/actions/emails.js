import { Email } from './types';
import {
  getEmailsByThreadId,
  updateUnreadEmailByThreadId,
  setMuteEmailById,
  setUnreadEmailById,
  updateEmail,
  unsendEmailEvent,
  getContactByIds
} from '../utils/electronInterface';
import { loadContacts } from './contacts';
import { updateLabelSuccess } from './labels';
import { EmailStatus } from '../utils/const';
import { getCriptextRecipients } from '../utils/EmailUtils';
import { unsendEmailFiles } from './files';

export const addEmails = emails => {
  return {
    type: Email.ADD_BATCH,
    emails: emails
  };
};

export const muteNotifications = emailId => {
  return {
    type: Email.MUTE,
    emailId
  };
};

export const markEmailUnreadSuccess = (emailId, unreadValue) => {
  return {
    type: Email.MARK_UNREAD,
    emailId,
    unread: unreadValue
  };
};

export const loadEmails = threadId => {
  return async dispatch => {
    try {
      const response = await getEmailsByThreadId(threadId);
      const data = response.reduce(
        (result, element) => {
          element.from = element.from
            ? element.from.split(',').map(Number)
            : [];
          element.to = element.to ? element.to.split(',').map(Number) : [];
          element.cc = element.cc ? element.cc.split(',').map(Number) : [];
          element.bcc = element.bcc ? element.bcc.split(',').map(Number) : [];
          element.fileTokens = element.fileTokens
            ? element.fileTokens.split(',')
            : [];
          element.labelIds = element.labelIds
            ? element.labelIds.split(',').map(Number)
            : [];
          const contactIds = [
            ...element.from,
            ...element.to,
            ...element.cc,
            ...element.bcc
          ];
          return {
            emails: { ...result.emails, [element.id]: element },
            contactIds: new Set([...result.contactIds, ...contactIds])
          };
        },
        { emails: {}, contactIds: new Set() }
      );
      data.contactIds = Array.from(data.contactIds);
      dispatch(loadContacts(data.contactIds));
      dispatch(addEmails(data.emails));
    } catch (e) {
      // TO DO
    }
  };
};

export const muteEmail = (emailId, valueToSet) => {
  return async dispatch => {
    try {
      await setMuteEmailById(emailId, valueToSet);
      dispatch(muteNotifications(emailId));
    } catch (e) {
      // To do
    }
  };
};

export const markEmailUnread = (emailId, valueToSet) => {
  return async dispatch => {
    try {
      await setUnreadEmailById(emailId, valueToSet ? true : false);
      dispatch(markEmailUnreadSuccess(emailId, valueToSet));
    } catch (e) {
      // To do
    }
  };
};

export const updateUnreadEmails = (thread, label) => {
  return async dispatch => {
    try {
      await updateUnreadEmailByThreadId(thread.id, thread.unread);
      if (label) {
        dispatch(updateLabelSuccess(label));
      }
    } catch (e) {
      // To do
    }
  };
};

export const unsendEmail = params => {
  return async dispatch => {
    const { key, emailId, contactIds, unsendDate } = params;
    try {
      const contacts = await getContactByIds(contactIds);
      const emails = contacts.map(contact => contact.email);
      const criptextRecipients = getCriptextRecipients(emails);
      const params = {
        metadataKey: Number(key),
        recipients: criptextRecipients
      };
      const { status } = await unsendEmailEvent(params);
      if (status === 200) {
        await updateEmail({
          key,
          status: EmailStatus.UNSEND,
          content: '',
          preview: '',
          unsendDate
        });
        dispatch(unsendEmailFiles(emailId)).then(() =>
          dispatch(unsendEmailOnSuccess(emailId, unsendDate))
        );
      }
    } catch (e) {
      // To do
    }
  };
};

export const unsendEmailOnSuccess = (emailId, unsendDate) => ({
  type: Email.UNSEND,
  emailId,
  unsendDate
});
