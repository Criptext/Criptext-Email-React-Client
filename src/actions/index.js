import * as ActionTypes from './ActionTypes';

export const addThreads = threads => {
  return {
    type: ActionTypes.Thread.ADD_BATCH,
    threads: threads
  };
};
