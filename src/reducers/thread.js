import * as Types from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      const selectedThread = state[action.selectedThread];
      return {
        ...state,
        [action.selectedThread]: {
          ...selectedThread,
          unread: false
        }
      };
    case Types.Thread.ADD_BATCH:
      return {
        ...state,
        ...action.threads
      };
    default:
      return state;
  }
};
