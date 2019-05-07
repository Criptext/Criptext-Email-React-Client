import { Account } from '../actions/types';
import { fromJS } from 'immutable';
import { defineAccounts } from './../utils/AccountUtils';
import { myAccount } from './../utils/electronInterface';

const activeAccount = defineAccounts([{ ...myAccount, isActive: true }]);
const initAccount = fromJS(activeAccount);

const accounts = (state = initAccount, action) => {
  switch (action.type) {
    case Account.ADD_BATCH: {
      const accounts = fromJS(action.accounts);
      return state.merge(accounts);
    }
    default:
      return state;
  }
};

export default accounts;
