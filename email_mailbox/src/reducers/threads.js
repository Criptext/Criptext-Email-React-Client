import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';
import * as StringUtils from '../utils/StringUtils';

const threads = (state = List([]), action) => {
  switch (action.type) {
    case Thread.UPDATE_UNREAD_THREAD: {
      const threadId = action.thread.id;
      return state.update(
        state.findIndex(item => item.get('id') === threadId),
        item => {
          return thread(item, action);
        }
      );
    }
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
        const fromContactName = thread.fromContactName || '';
        return Map(thread).merge({
          labels: Set(
            thread.labels ? thread.labels.split(',').map(Number) : []
          ),
          allLabels: Set(
            thread.allLabels ? thread.allLabels.split(',').map(Number) : []
          ),
          emailIds: List(thread.emailIds.split(',').map(Number)),
          subject,
          timestamp: thread.date,
          lastEmailId: thread.key,
          unread: thread.unread ? true : false,
          fromContactName: List(fromContactName.split(','))
        });
      });
      if (action.clear) {
        return List(threads);
      }
      return state.concat(List(threads));
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
        if (!action.threadIds.includes(thread.get('id'))) {
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
    case Thread.REMOVE_THREADS: {
      return state.filter(
        thread => !action.threadsIds.includes(thread.get('id'))
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
    case Thread.UPDATE_UNREAD_THREADS: {
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
      const threadIds = action.threadIds;
      return state.filterNot(thread => threadIds.includes(thread.get('id')));
    }
    case Thread.ADD_EMAIL: {
      const { threadId, emailId } = action;
      if (!threadId || !emailId) {
        return state;
      }
      return state.map(threadItem => {
        if (threadItem.get('id') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.UPDATE_STATUS: {
      const { status, threadId } = action;
      if (!threadId || !status) {
        return state;
      }
      return state.map(threadItem => {
        if (threadItem.get('id') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    default:
      return state;
  }
};

const thread = (state, action) => {
  switch (action.type) {
    case Thread.UPDATE_UNREAD_THREAD: {
      return state.set('unread', action.thread.unread);
    }
    case Thread.ADD_EMAIL: {
      return state.set('emailIds', state.get('emailIds').push(action.emailId));
    }
    case Thread.UPDATE_STATUS: {
      return state.set('status', action.status);
    }
    default:
      return state;
  }
};

export default threads;
