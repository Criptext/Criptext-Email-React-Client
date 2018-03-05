import { Email } from './types';
import {
  getEmailsByThreadId,
  setMuteEmailById
} from '../utils/electronInterface';

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
      response.forEach(element => {
        emails[element.id] = element;
      });
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
