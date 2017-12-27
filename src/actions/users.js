import * as Types from './types';

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