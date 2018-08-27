import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';
import * as StringUtils from '../utils/StringUtils';

const threads = (state = List([]), action) => {
  switch (action.type) {
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
    case Thread.ADD_EMAILID_THREAD: {
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
    case Thread.MOVE_THREADS: {
      const threadIds = action.threadIds;
      return state.filterNot(thread =>
        threadIds.includes(thread.get('threadId'))
      );
    }
    case Thread.REMOVE_EMAILIDS_THREAD: {
      const { threadId, emailIds } = action;
      if (!threadId || !emailIds) {
        return state;
      }
      return state.map(threadItem => {
        if (threadItem.get('id') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.UPDATE_STATUS_THREAD: {
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
    case Thread.UPDATE_UNREAD_THREADS: {
      const { threadIds, unread } = action;
      if (!threadIds || !threadIds.length || typeof unread !== 'boolean') {
        return state;
      }
      return state.map(threadItem => {
        return threadIds.includes(threadItem.get('threadId'))
          ? thread(threadItem, action)
          : threadItem;
      });
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
    case Thread.ADD_LABEL_THREAD: {
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
    case Thread.ADD_LABEL_THREADS: {
      return state.map(thread => {
        if (!action.threadIds.includes(thread.get('id'))) {
          return thread;
        }
        const allLabels = thread.get('allLabels').add(action.label);
        const labels = thread.get('labels').add(action.label);
        return thread.merge({ allLabels, labels });
      });
    }
    case Thread.REMOVE_LABEL_THREAD: {
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
    case Thread.REMOVE_LABEL_THREADS: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        const allLabels = thread.get('allLabels').delete(action.label);
        const labels = thread.get('labels').delete(action.label);
        return thread.merge({ allLabels, labels });
      });
    }
    case Thread.UNREAD_FILTER: {
      return state.map(thread => thread.set('selected', false));
    }
    case Thread.REMOVE_THREAD: {
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
    case Thread.REMOVE_THREADS_BY_THREAD_ID: {
      const { threadIds } = action;
      if (!threadIds) {
        return state;
      }
      return state.filterNot(threadItem =>
        threadIds.includes(threadItem.get('threadId'))
      );
    }
    default:
      return state;
  }
};

const thread = (state, action) => {
  switch (action.type) {
    case Thread.ADD_EMAILID_THREAD: {
      return state.set('emailIds', state.get('emailIds').push(action.emailId));
    }
    case Thread.REMOVE_EMAILIDS_THREAD: {
      const emailIdsToRemove = action.emailIds;
      return state.set(
        'emailIds',
        state
          .get('emailIds')
          .filter(emailId => !emailIdsToRemove.includes(emailId))
      );
    }
    case Thread.UPDATE_STATUS_THREAD: {
      return state.set('status', action.status);
    }
    case Thread.UPDATE_UNREAD_THREADS: {
      return state.set('unread', action.unread);
    }
    default:
      return state;
  }
};

export default threads;
