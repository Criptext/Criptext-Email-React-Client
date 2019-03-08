import { Suggestions } from './types';
import { getEmailsGroupByThreadByParams } from '../utils/ipc';
import { getMatches } from '../utils/storage';
import { LabelType } from '../utils/electronInterface';

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
        labelId: -2,
        rejectedLabelIds: [LabelType.spam.id, LabelType.trash.id],
        limit: 5
      });
      dispatch(setSuggestions(threads, hints));
    } catch (e) {
      dispatch(setSuggestionError('Unable to load suggestions'));
    }
  };
};
