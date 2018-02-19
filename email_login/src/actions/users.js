import { User } from './types';
import { createUser } from '../utils/electronInterface';

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    user: users
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
          nickname: user.username
        }
      };
      dispatch(addUsers(users));
    } catch (e) {
      //TO DO
    }
  };
};
