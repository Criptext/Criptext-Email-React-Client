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
    case Types.Thread.ADD_THREAD_LABEL:
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
    case Types.Thread.ADD_THREADS_LABEL:
      return state.map(thread => {
        if(!action.threadsIds.includes(thread.get('id'))){
          return thread;
        }
        return thread.update('labels', labels => labels.add(action.label))
      });
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
    case Types.Thread.REMOVE_THREADS_LABEL:
      return state.map(thread => {
        if(!action.threadsIds.includes(thread.get('id'))){
          return thread;
        }
        return thread.update('labels', labels => labels.delete(action.label))
      });
    case Types.Thread.THREAD_READ:
      return state.map(thread => {
        if(!action.threadsIds.includes(thread.get('id'))){
          return thread;
        }
        return thread.set('unread', !action.read)
      });
    case Types.Thread.UNREAD_FILTER:
      return state.map(thread => thread.set('selected', false));
    case Types.Thread.REMOVE:
      return state.filterNot( thread => thread.get('id') === action.targetThread)
    case Types.Thread.DESELECT_THREADS:
      return state.map(thread => thread.set('selected', false));
    case Types.Thread.SELECT_THREADS:
      return state.map(thread => thread.set('selected', true));
    case Types.Thread.MOVE_THREADS:
      return state.filterNot( thread => {
        return action.threadsIds.includes(thread.get('id'))
      })
    default:
      return state;
  }
};
