import { createSelector } from 'reselect';
import { compareAccounts } from '../utils/AccountUtils';

const getAccounts = state => state.get('accounts');

export const getAllAccounts = createSelector([getAccounts], accounts =>
  defineAccounts(accounts)
);

const defineAccounts = accounts => {
  const result = accounts.toArray().map(account => {
    return account.toJS();
  });
  return result.sort(compareAccounts);
};
