import { User } from './types';
import { createUser } from '../utils/electronInterface';

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return async dispatch => {
    try {
      const response = await createUser(user);
      const userId = response[0];
      const users = {
        [userId]: {
          id: userId,
          email: user.email,
          name: user.name,
          nickname: user.nickname
        }
      };
      dispatch(addUsers(users));
      localStorage.setItem('sessionId', userId);
    } catch (e) {
      //TO DO
    }
  };
};
