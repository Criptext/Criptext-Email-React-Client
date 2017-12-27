import * as Types from './types';

/* USER
   ----------------------------- */
export const addUsers = users => {
  return {
    type: Types.User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return {
    type: Types.User.ADD,
    user: user
  };
};

/* THREAD
   ----------------------------- */
export const addThreads = threads => {
  return {
    type: Types.Thread.ADD_BATCH,
    threads: threads
  };
};

export const selectThread = threadId => {
  return {
    type: Types.Thread.SELECT,
    selectedThread: threadId
  };
};

export const loadThreads = () => {
  return dispatch => {
    return fetch('/threads.json')
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        dispatch(addThreads(json.threads));
      })
      .catch(err => {
        console.error(err);
      });
  };
};
/* EMAIL
   ----------------------------- */
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