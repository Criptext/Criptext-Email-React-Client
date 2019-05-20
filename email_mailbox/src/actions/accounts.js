import { Account } from './types';

export const addAccounts = accounts => {
  return {
    type: Account.ADD_BATCH,
    accounts
  };
};

export const updateAccounts = accounts => {
  return {
    type: Account.UPDATE_ACCOUNTS,
    accounts
  };
};
