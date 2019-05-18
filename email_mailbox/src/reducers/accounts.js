import { Account, Activity } from '../actions/types';
import { fromJS } from 'immutable';
import { defineAccounts } from './../utils/AccountUtils';
import { myAccount } from './../utils/electronInterface';

const formAccounts = account => {
  const activeAccount = { ...account, isActive: true };
  const inactiveAccounts = account.logged
    ? Object.keys(account.logged).map(key => {
        const item = account.logged[key];
        return item;
      })
    : [];
  return [activeAccount, ...inactiveAccounts];
};

const initAccounts = account => fromJS(defineAccounts(formAccounts(account)));

const accounts = (state = initAccounts(myAccount), action) => {
  switch (action.type) {
    case Account.ADD_BATCH: {
      const accounts = fromJS(action.accounts);
      return state.merge(accounts);
    }
    case Activity.LOGOUT: {
      return initAccounts(myAccount);
    }

    default:
      return state;
  }
};

export default accounts;
