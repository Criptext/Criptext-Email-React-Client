import { User } from './types';

export const addUser = user => {
  return {
    type: User.ADD,
    user: user
  };
};
