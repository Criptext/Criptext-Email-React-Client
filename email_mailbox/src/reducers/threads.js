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
          unread: !!thread.unread,
          fromContactName: List(fromContactName.split(','))
        });
      });
      if (action.clear) {
        return List(threads);
      }
      return state.concat(List(threads));
    }
    case Thread.ADD_LABELID_THREAD: {
      const { threadId, labelId } = action;
      if (!threadId || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadItem.get('threadId') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.ADD_LABELID_THREAD_DRAFT: {
      const { uniqueId, labelId } = action;
      if (typeof uniqueId !== 'number' || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadItem.get('uniqueId') === uniqueId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.ADD_LABELID_THREADS: {
      const { threadIds, labelId } = action;
      if (!threadIds || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadIds.includes(threadItem.get('threadId'))) {
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
    case Thread.REMOVE_LABELID_THREAD: {
      const { threadId, labelId } = action;
      if (!threadId || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadItem.get('threadId') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.REMOVE_LABELID_THREAD_DRAFT: {
      const { uniqueId, labelId } = action;
      if (typeof uniqueId !== 'number' || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadItem.get('uniqueId') === uniqueId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.REMOVE_LABELID_THREADS: {
      const { threadIds, labelId } = action;
      if (!threadIds || typeof labelId !== 'number') {
        return state;
      }

      return state.map(threadItem => {
        if (threadIds.includes(threadItem.get('threadId'))) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.UPDATE_EMAILIDS_THREAD: {
      const { threadId, emailIdToAdd, emailIdsToRemove } = action;
      if (!threadId || (!emailIdToAdd && !emailIdsToRemove)) {
        return state;
      }
      return state.map(threadItem => {
        if (threadItem.get('threadId') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
    }
    case Thread.UPDATE_STATUS_THREAD: {
      const { threadId, status } = action;
      if (!threadId || typeof status !== 'number') {
        return state;
      }
      return state.map(threadItem => {
        if (threadItem.get('threadId') === threadId) {
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
    case Thread.REMOVE_THREADS: {
      return state.filter(
        thread => !action.threadsIds.includes(thread.get('id'))
      );
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
    case Thread.ADD_LABELID_THREAD: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').add(labelId);
      const labels = state.get('labels').add(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.ADD_LABELID_THREAD_DRAFT: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').add(labelId);
      const labels = state.get('labels').add(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.ADD_LABELID_THREADS: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').add(labelId);
      const labels = state.get('labels').add(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.REMOVE_LABELID_THREAD: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').delete(labelId);
      const labels = state.get('labels').delete(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.REMOVE_LABELID_THREAD_DRAFT: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').delete(labelId);
      const labels = state.get('labels').delete(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.REMOVE_LABELID_THREADS: {
      const { labelId } = action;
      const allLabels = state.get('allLabels').delete(labelId);
      const labels = state.get('labels').delete(labelId);
      return state.merge({ allLabels, labels });
    }
    case Thread.UPDATE_EMAILIDS_THREAD: {
      const { emailIdToAdd, emailIdsToRemove } = action;
      let emailIds = state.get('emailIds');
      if (emailIdsToRemove) {
        emailIds = emailIds.filter(
          emailId => !emailIdsToRemove.includes(emailId)
        );
      }
      if (emailIdToAdd) {
        emailIds = emailIds.push(emailIdToAdd);
      }
      return state.set('emailIds', emailIds);
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
