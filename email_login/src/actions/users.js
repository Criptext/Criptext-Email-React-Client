import { User } from './types';
import * as db from '../utils/electronInterface';
import ClientAPI from '@criptext/email-http-client';

const client = new ClientAPI('http://localhost:8000');

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    users: users
  };
};

export const checkUser = user => {
  return {
    type: User.CHECK,
    user: user
  };
};

export const addUser = user => {
  return async () => {
    try {
      const serverResponse = await client.postUser(user);
      const responseStatus = await serverResponse.status;
      if (responseStatus === 200) {
        const localResponse = await createLocalData(user);
        const userId = await localResponse[0];
        const terminated = await createSession(userId, user);
        if (terminated) {
          db.openLoading();
          db.closeLogin();
        }
      }
    } catch (e) {
      //TO DO
    }
  };
};

const createLocalData = user => {
  const localData = {
    username: user.username,
    name: user.name,
    recoveryEmail: user.recoveryEmail ? user.recoveryEmail : ''
  };
  return db.createUser(localData);
};

const createSession = (id, user) => {
  const sessionData = {
    sessionId: id,
    username: user.username
  };
  return db.createSession(sessionData);
};

export const verifyUser = user => {
  return async dispatch => {
    try {
      const credentials = {
        username: 'jadams',
        password: '1234',
        deviceId: 1
      };

      await client
        .login(credentials)
        .then(() => {
          dispatch(addUsers(user));
        })
        .catch(() => {
          // Handle error
        });
    } catch (e) {
      // To do
    }
  };
};
