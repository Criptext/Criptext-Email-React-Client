import { Email } from './types';
import {
  getEmailsByThreadId,
  setMuteEmailById
} from '../utils/electronInterface';
import { loadContacts } from './contacts';

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

export const loadEmails = threadId => {
  return async dispatch => {
    try {
      const response = await getEmailsByThreadId(threadId);
      const data = response.reduce(
        (result, element) => {
          element.from = element.from ? element.from.split(',') : [];
          element.to = element.to ? element.to.split(',') : [];
          element.cc = element.cc ? element.cc.split(',') : [];
          element.bcc = element.bcc ? element.bcc.split(',') : [];
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
