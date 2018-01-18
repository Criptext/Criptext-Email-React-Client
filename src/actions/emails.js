import { Email } from './types';

export const addEmails = emails => {
  return {
    type: Email.ADD_BATCH,
    emails: emails
  };
};

export const loadEmails = () => {
  return async dispatch => {
    try {
      const response = await fetch('/emails.json');
      const json = await response.json();
      const emails = {};
      json.emails.forEach(element => {
        emails[element.id] = element;
      });
      dispatch(addEmails(emails));
    } catch (e) {
      // TO DO
    }
  };
};
