import { Suggestions } from './types';
import { getEmailsGroupByThreadByParams } from '../utils/ipc';
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
      const threads = await getEmailsGroupByThreadByParams({
        plain: true,
        text: filter,
        labelId: -1,
        limit: 5
      });
      dispatch(setSuggestions(threads, hints));
    } catch (e) {
      dispatch(setSuggestionError('Unable to load suggestions'));
    }
  };
};
