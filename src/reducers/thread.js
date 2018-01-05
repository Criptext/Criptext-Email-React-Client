import * as Types from '../actions/types';
import { Map, Set, List } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      const newThreads = state
        .map(thread => thread.set('selected', false))
        .update(state.findIndex(function(item) {
          return item.get('id') === action.selectedThread;
        }), function(item) {
          return item.set('unread', false);
        })
      return newThreads;
    case Types.Thread.ADD_BATCH:
      const threads = action.threads.map(thread => {
        return Map(thread).merge({
          labels: Set(thread.labels),
          emails: List(thread.emails)
        });
      });
      return state.concat(List(threads));
    case Types.Thread.MULTISELECT:
      return state.update(
        state.findIndex(function(item) {
          return item.get('id') === action.selectedThread;
        }),
        function(item) {
          return item.set('selected', action.value);
        }
      );
    case Types.Thread.ADD_LABEL:
      return state.update(
        state.findIndex(function(thread) {
          return thread.get('id') === action.targetThread;
        }),
        function(thread) {
          return thread.update('labels', labels => {
            return labels.add(action.label);
          });
        }
      );
    case Types.Thread.REMOVE_LABEL:
      return state.update(
        state.findIndex(function(thread) {
          return thread.get('id') === action.targetThread;
        }),
        function(thread) {
          return thread.update('labels', labels => {
            return labels.delete(action.label);
          });
        }
      );
    case Types.Thread.UNREAD_FILTER:
      return state.map(thread => thread.set('selected', false));
    default:
      return state;
  }
};
