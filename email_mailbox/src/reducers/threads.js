import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';
import * as StringUtils from '../utils/StringUtils';

const threads = (state = List([]), action) => {
  switch (action.type) {
    case Thread.SELECT: {
      const newThreads = state
        .map(thread => thread.set('selected', false))
        .update(
          state.findIndex(function(item) {
            return item.get('id') === action.threadId;
          }),
          function(item) {
            if (!item) {
              return;
            }
            return item.set('unread', false);
          }
        );
      return newThreads;
    }
    case Thread.ADD_BATCH: {
      const threads = action.threads.map(thread => {
        const subject = StringUtils.removeActionsFromSubject(thread.subject);
        return Map(thread).merge({
          labels: Set(
            thread.labels ? thread.labels.split(',').map(Number) : []
          ),
          allLabels: Set(
            thread.allLabels ? thread.allLabels.split(',').map(Number) : []
          ),
          emailIds: List(thread.emailIds.split(',').map(Number)),
          subject,
          date: thread.date,
          timestamp: thread.date,
          hasOpenAttachments: false,
          lastEmailId: thread.key,
          status: 1,
          timesOpened: 2,
          timer: 1,
          totalAttachments: 1,
          unread: thread.isUnread ? true : false,
          selected: false,
          fromContactName: List(thread.fromContactName.split(','))
        });
      });
      if (action.clear) {
        return List(threads);
      }
      return state.concat(List(threads));
    }
    case Thread.MULTISELECT: {
      return state.update(
        state.findIndex(item => {
          return item.get('id') === action.selectedThread;
        }),
        item => {
          return item.set('selected', action.value);
        }
      );
    }
    case Thread.ADD_THREAD_LABEL: {
      return state.update(
        state.findIndex(thread => {
          return thread.get('id') === action.targetThread;
        }),
        thread => {
          const allLabels = thread.get('allLabels').add(action.label);
          const labels = thread.get('labels').add(action.label);
          return thread.merge({ allLabels, labels });
        }
      );
    }
    case Thread.ADD_THREADS_LABEL: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        const allLabels = thread.get('allLabels').add(action.label);
        const labels = thread.get('labels').add(action.label);
        return thread.merge({ allLabels, labels });
      });
    }
    case Thread.REMOVE_LABEL: {
      return state.update(
        state.findIndex(thread => thread.get('id') === action.targetThread),
        thread => {
          const allLabels = thread.get('allLabels').delete(action.label);
          const labels = thread.get('labels').delete(action.label);
          return thread.merge({ allLabels, labels });
        }
      );
    }
    case Thread.REMOVE_THREADS_LABEL: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        const allLabels = thread.get('allLabels').delete(action.label);
        const labels = thread.get('labels').delete(action.label);
        return thread.merge({ allLabels, labels });
      });
    }
    case Thread.READ_THREADS: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.set('unread', !action.read);
      });
    }
    case Thread.UNREAD_FILTER: {
      return state.map(thread => thread.set('selected', false));
    }
    case Thread.REMOVE: {
      return state.filterNot(
        thread => thread.get('id') === action.targetThread
      );
    }
    case Thread.DESELECT_THREADS: {
      return state.map(thread => thread.set('selected', false));
    }
    case Thread.SELECT_THREADS: {
      return state.map(thread => thread.set('selected', true));
    }
    case Thread.MOVE_THREADS: {
      return state.filterNot(thread => {
        return action.threadsIds.includes(thread.get('id'));
      });
    }
    default:
      return state;
  }
};

export default threads;
