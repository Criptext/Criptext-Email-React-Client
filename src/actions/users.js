import { User } from './types';

export const addUsers = users => {
  return {
    type: User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return {
    type: User.ADD,
    user: user
  };
};
