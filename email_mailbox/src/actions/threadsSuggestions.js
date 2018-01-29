import { ThreadSuggestions } from './types';
import { simpleThreadsFilter } from '../utils/electronInterface';
import { getMatches } from '../utils/storage'

export const setSuggestions = (threads, hints) => ({
  type: ThreadSuggestions.SET_THREADS,
  threads,
  hints
});

export const loadThreadsSuggestions = filter => {
  return async dispatch => {
    try {
      const hints = await getMatches(filter);
      const threads = await simpleThreadsFilter(filter);
      dispatch(setSuggestions(threads, hints));
    } catch (e) {
      // TO DO
    }
  };
};
