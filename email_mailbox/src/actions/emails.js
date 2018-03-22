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
    targetEmail: emailId
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
          return {
            emails: { ...result.emails, [element.id]: element },
            contactIds: [
              ...result.contactIds,
              ...element.from,
              ...element.to,
              ...element.cc,
              ...element.bcc
            ]
          };
        },
        { emails: {}, contactIds: [] }
      );
      dispatch(loadContacts(data.contactIds));
      dispatch(addEmails(data.emails));
    } catch (e) {
      // TO DO
    }
  };
};

export const muteEmailById = feed => {
  return async dispatch => {
    try {
      const valueToSet = feed.get('isMuted') === 1 ? false : true;
      await setMuteEmailById(feed.get('emailId'), valueToSet);
      dispatch(muteNotifications(feed.get('emailId')));
    } catch (e) {
      // To do
    }
  };
};
