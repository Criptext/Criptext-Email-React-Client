import { Account } from './types';
import { defineBadgeAccounts } from './../utils/AccountUtils';

export const updateAccounts = accounts => {
  return {
    type: Account.UPDATE_ACCOUNTS,
    accounts
  };
};

export const updateBadgeAccounts = () => {
  return async dispatch => {
    const accounts = await defineBadgeAccounts();
    dispatch(updateAccounts(accounts));
  };
};
