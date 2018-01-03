import * as Types from '../actions/types';
import { Map, Set, List } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      return state.update(action.selectedThread, thread => {
        return thread.set('unread', false);
      });
    case Types.Thread.ADD_BATCH:
      const threads = action.threads.map(thread => {
        return Map(thread).set('labels', Set(thread.labels));
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
    default:
      return state;
  }
};
