import { Suggestions } from './types';
import { getEmailsGroupByThreadByMatchText } from '../utils/electronInterface';
import { getMatches } from '../utils/storage';

export const setSuggestions = (threads, hints) => ({
  type: Suggestions.SET_THREADS,
  threads,
  hints
});

export const setSuggestionError = error => ({
  type: Suggestions.SET_ERROR_SUGGESTIONS,
  error: error
});

export const loadSuggestions = filter => {
  return async dispatch => {
    try {
      const hints = await getMatches(filter);
      const threads = await getEmailsGroupByThreadByMatchText(filter);
      dispatch(setSuggestions(threads, hints));
    } catch (e) {
      dispatch(setSuggestionError('Unable to load suggestions'));
    }
  };
};
