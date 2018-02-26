import { User } from './types';
import {
  closeLogin,
  createSession,
  createUser,
  openCreateKeys,
  openMailbox
} from '../utils/electronInterface';
import { API_URL } from './../utils/const';
import ClientAPI from '@criptext/email-http-client';

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return async () => {
    try {
      const client = new ClientAPI(API_URL);
      const serverResponse = await client.postUser(user);
      const responseStatus = await serverResponse.status;
      if (responseStatus === 200) {
        const localResponse = await createLocalData(user);
        const userId = await localResponse[0];
        const terminated = await createLocalSession(userId, user);
        if (terminated) {
          openCreateKeys(user);
          closeLogin();
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
  return createUser(localData);
};

const createLocalSession = (id, user) => {
  const sessionData = {
    sessionId: id,
    username: user.username
  };
  return createSession(sessionData);
};

export const loginUser = user => {
  return async () => {
    try {
      const userCredentials = {
        username: user.username,
        password: user.password,
        deviceId: 1
      };
      const client = new ClientAPI(API_URL);
      const serverResponse = await client.login(userCredentials);
      const responseStatus = await serverResponse.status;
      if (responseStatus === 200) {
        openMailbox();
        closeLogin();
      } else {
        alert(serverResponse.text);
      }
    } catch (e) {
      // To do
    }
  };
};
