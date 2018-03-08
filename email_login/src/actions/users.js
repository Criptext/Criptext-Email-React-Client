import { User } from './types';
import {
  closeLogin,
  createAccount,
  createContact,
  openCreateKeys,
  openMailbox
} from '../utils/electronInterface';
import { API_URL } from './../utils/const';
import ClientAPI from '@criptext/email-http-client';
const client = new ClientAPI(API_URL);

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return async () => {
    try {
      const serverResponse = await client.postUser(user);
      const responseStatus = serverResponse.status;
      if (responseStatus === 200) {
        const localResponse = await createLocalData(user);
        const userId = localResponse[0];
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
    name: user.name
  };
  return createContact(localData);
};

const createLocalSession = (id, user) => {
  const sessionData = {
    sessionId: id,
    username: user.username
  };
  return createAccount(sessionData);
};

export const loginUser = user => {
  return async () => {
    try {
      const userCredentials = {
        username: user.username,
        password: user.password,
        deviceId: 1
      };
      const serverResponse = await client.login(userCredentials);
      const responseStatus = serverResponse.status;
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
