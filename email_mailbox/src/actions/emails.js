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
      const emails = {};
      let contactIds = [];
      response.forEach(element => {
        element.from = element.from ? element.from.split(',') : null;
        element.to = element.to ? element.to.split(',') : null;
        element.cc = element.cc ? element.cc.split(',') : null;
        element.bcc = element.bcc ? element.bcc.split(',') : null;
        emails[element.id] = element;
        contactIds = [
          ...contactIds,
          ...element.from,
          ...element.to,
          ...element.cc,
          ...element.bcc
        ];
      });
      dispatch(loadContacts(contactIds));
      dispatch(addEmails(emails));
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
