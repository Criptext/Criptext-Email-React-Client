import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Thread.SELECT:
      const newThreads = state
        .map(thread => thread.set('selected', false))
        .update(
          state.findIndex(function(item) {
            return item.get('id') === action.selectedThread;
          }),
          function(item) {
            return item.set('unread', false);
          }
        );
      return newThreads;
    case Thread.ADD_BATCH:
      const threads = action.threads.map(thread => {
        return Map(thread).merge({
          labels: Set(thread.labels),
          emails: List(thread.emails)
        });
      });
      return state.concat(List(threads));
    case Thread.MULTISELECT:
      return state.update(
        state.findIndex(function(item) {
          return item.get('id') === action.selectedThread;
        }),
        function(item) {
          return item.set('selected', action.value);
        }
      );
    case Thread.ADD_THREAD_LABEL:
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
    case Thread.ADD_THREADS_LABEL:
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.update('labels', labels => labels.add(action.label));
      });
    case Thread.REMOVE_LABEL:
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
    case Thread.REMOVE_THREADS_LABEL:
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.update('labels', labels => labels.delete(action.label));
      });
    case Thread.READ_THREADS:
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.set('unread', !action.read);
      });
    case Thread.UNREAD_FILTER:
      return state.map(thread => thread.set('selected', false));
    case Thread.REMOVE:
      return state.filterNot(
        thread => thread.get('id') === action.targetThread
      );
    case Thread.DESELECT_THREADS:
      return state.map(thread => thread.set('selected', false));
    case Thread.SELECT_THREADS:
      return state.map(thread => thread.set('selected', true));
    case Thread.MOVE_THREADS:
      return state.filterNot(thread => {
        return action.threadsIds.includes(thread.get('id'));
      });
    default:
      return state;
  }
};
