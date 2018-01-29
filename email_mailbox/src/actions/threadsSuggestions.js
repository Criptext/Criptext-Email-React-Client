import { ThreadSuggestions } from './types';
import { simpleThreadsFilter } from '../utils/electronInterface';

export const setThreads = threads => ({
  type: ThreadSuggestions.SET_THREADS,
  threads: threads
});

export const loadThreadsSuggestions = filter => {
  return async dispatch => {
    try {
      const threads = await simpleThreadsFilter(filter);
      dispatch(setThreads(threads));
    } catch (e) {
      // TO DO
    }
  };
};
