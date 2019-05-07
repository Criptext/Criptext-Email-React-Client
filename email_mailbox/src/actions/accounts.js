import { Account } from './types';

export const addAccounts = accounts => {
  return {
    type: Account.ADD_BATCH,
    accounts
  };
};
