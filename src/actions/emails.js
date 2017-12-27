import * as Types from './types';

export const addEmails = emails => {
  return {
    type: Types.Email.ADD_BATCH,
    emails: emails
  };
};

export const loadEmails = () => {
  return dispatch => {
    return fetch('/emails.json')
      .then(response => {
        if(response.status === 200){
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        dispatch(addEmails(json.emails));
      })
      .catch(err => {
        console.log(err);
      });
  }
}