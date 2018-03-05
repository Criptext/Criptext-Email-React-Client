import { Email } from './types';
import { getEmailsByThreadId } from '../utils/electronInterface';

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
