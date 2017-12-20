import * as Types from './types';

export const addThreads = threads => {
  return {
    type: Types.Thread.ADD_BATCH,
    threads: threads
  };
};
