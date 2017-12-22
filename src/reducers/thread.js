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
      let newThreads = action.threads;
      if (Array.isArray(newThreads)) {
        newThreads = {};
        action.threads.forEach(thread => {
          newThreads[thread.id.toString()] = thread;
        });
      }
      return {
        ...state,
        ...newThreads
      };
    default:
      return state;
  }
};
