import { Email } from './types';

export const addEmails = emails => {
  return {
    type: Email.ADD_BATCH,
    emails: emails
  };
};

export const loadEmails = () => {
  return dispatch => {
    return fetch('/emails.json')
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        let emails = {};
        json.emails.forEach(element => {
          emails[element.id] = element;
        });
        dispatch(addEmails(emails));
      })
      .catch(err => {
        console.log(err);
      });
  };
};
