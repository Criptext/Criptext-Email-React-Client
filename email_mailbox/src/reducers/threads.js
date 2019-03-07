import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';
import * as StringUtils from '../utils/StringUtils';

const initThreads = Map({
  1: Map({
    list: List([]),
    allIds: Set([])
  })
});

const initMailbox = Map({
  list: List([]),
  allIds: Set([])
});

const mailbox = (state = initThreads, action) => {
  switch (action.type) {
    case Thread.ADD_BATCH: {
      const labelId = action.labelId;
      const mailbox = state.get(`${labelId}`) || initMailbox;
      return state.merge({
        [labelId]: threads(mailbox, action)
      });
    }
    case Thread.ADD_LABELID_THREAD:
    case Thread.ADD_LABELID_THREADS:
    case Thread.MOVE_THREADS:
    case Thread.REMOVE_LABELID_THREAD:
    case Thread.REMOVE_LABELID_THREADS:
    case Thread.REMOVE_THREADS:
    case Thread.UPDATE_EMAILIDS_THREAD:
    case Thread.UPDATE_THREAD:
    case Thread.UPDATE_THREADS: {
      const labelId = action.labelId;
      if (!labelId) return state;
      const mailbox = state.get(`${labelId}`);
      if (!mailbox) return state;
      return state.merge({
        [labelId]: threads(mailbox, action)
      });
    }
    default:
      return state;
  }
};

const threads = (state, action) => {
  switch (action.type) {
    case Thread.ADD_BATCH: {
      let allIds = Set([]);
      const allIdsState = state.get('allIds');
      let threads = action.threads.map(thread => {
        const subject = StringUtils.removeActionsFromSubject(thread.subject);
        const fromContactName = thread.fromContactName || '';
        allIds = allIds.add(thread.uniqueId);
        return Map(thread).merge({
          labels: Set(
            thread.labels ? thread.labels.split(',').map(Number) : []
          ),
          allLabels: Set(
            thread.allLabels ? thread.allLabels.split(',').map(Number) : []
          ),
          emailIds: List(thread.emailIds.split(',').map(Number)),
          subject,
          lastEmailId: thread.key,
          unread: !!thread.unread,
          recipientContactIds: Set(
            thread.recipientContactIds
              ? thread.recipientContactIds.split(',').map(Number)
              : []
          ),
          fromContactName: List(fromContactName.split(','))
        });
      });
      if (action.clear) {
        return state.merge({
          list: List(threads),
          allIds
        });
      }

      threads = threads.filter(
        thread => !allIdsState.has(thread.get('uniqueId'))
      );
      return state.merge({
        list: state.get('list').concat(List(threads)),
        allIds: allIdsState.union(allIds)
      });
    }
    case Thread.ADD_LABELID_THREAD: {
      const { threadId, labelIdToAdd } = action;
      if (!threadId || typeof labelIdToAdd !== 'number') {
        return state;
      }

      const list = state.get('list').map(threadItem => {
        if (threadItem.get('uniqueId') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
      return state.set('list', list);
    }
    case Thread.ADD_LABELID_THREADS: {
      const { threadIds, labelIdToAdd } = action;
      if (!threadIds || typeof labelIdToAdd !== 'number') {
        return state;
      }

      const list = state.get('list').map(threadItem => {
        if (threadIds.includes(threadItem.get('uniqueId'))) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
      return state.set('list', list);
    }
    case Thread.MOVE_THREADS: {
      const { threadIds } = action;
      if (!threadIds) return state;

      const list = state
        .get('list')
        .filterNot(thread => threadIds.includes(thread.get('threadId')));
      const allIds = state
        .get('allIds')
        .filterNot(id => threadIds.includes(id));
      return state.merge({
        list,
        allIds
      });
    }
    case Thread.REMOVE_LABELID_THREAD: {
      const { uniqueId, labelIdToRemove } = action;
      if (!uniqueId || typeof labelIdToRemove !== 'number') {
        return state;
      }

      const list = state.get('list').map(threadItem => {
        if (threadItem.get('uniqueId') === uniqueId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
      return state.set('list', list);
    }
    case Thread.REMOVE_LABELID_THREADS: {
      const { threadIds, labelIdToRemove } = action;
      if (!threadIds || typeof labelIdToRemove !== 'number') {
        return state;
      }

      const list = state.get('list').map(threadItem => {
        if (threadIds.includes(threadItem.get('threadId'))) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
      return state.set('list', list);
    }
    case Thread.REMOVE_THREADS: {
      const { uniqueIds } = action;
      if (!uniqueIds) {
        return state;
      }
      const list = state
        .get('list')
        .filterNot(thread => uniqueIds.includes(thread.get('uniqueId')));
      const allIds = state
        .get('allIds')
        .filterNot(id => uniqueIds.includes(id));
      return state.merge({
        list,
        allIds
      });
    }
    case Thread.UPDATE_EMAILIDS_THREAD: {
      const { threadId, emailIdToAdd, emailIdsToRemove, emailIds } = action;
      if (!threadId || (!emailIdToAdd && !emailIdsToRemove && !emailIds)) {
        return state;
      }
      const list = state
        .get('list')
        .map(threadItem => {
          if (threadItem.get('threadId') === threadId) {
            return thread(threadItem, action);
          }
          return threadItem;
        })
        .filter(threadItem => threadItem.get('emailIds').size);
      const allIds = list.map(threadItem => threadItem.get('uniqueId'));
      return state.merge({
        list,
        allIds
      });
    }
    case Thread.UPDATE_THREAD: {
      const { threadId } = action;
      if (!threadId) return state;
      const list = state.get('list').map(threadItem => {
        if (threadItem.get('threadId') === threadId) {
          return thread(threadItem, action);
        }
        return threadItem;
      });
      return state.set('list', list);
    }
    case Thread.UPDATE_THREADS: {
      const { threadIds } = action;
      if (!threadIds || !threadIds.length) {
        return state;
      }
      const list = state.get('list').map(threadItem => {
        return threadIds.includes(threadItem.get('threadId'))
          ? thread(threadItem, action)
          : threadItem;
      });
      return state.set('list', list);
    }
    default:
      return state;
  }
};

const thread = (state, action) => {
  switch (action.type) {
    case Thread.ADD_LABELID_THREAD: {
      const { labelIdToAdd } = action;
      const allLabels = state.get('allLabels').add(labelIdToAdd);
      const labels = state.get('labels').add(labelIdToAdd);
      return state.merge({ allLabels, labels });
    }
    case Thread.ADD_LABELID_THREADS: {
      const { labelIdToAdd } = action;
      const allLabels = state.get('allLabels').add(labelIdToAdd);
      const labels = state.get('labels').add(labelIdToAdd);
      return state.merge({ allLabels, labels });
    }
    case Thread.REMOVE_LABELID_THREAD: {
      const { labelIdToRemove } = action;
      const allLabels = state.get('allLabels').delete(labelIdToRemove);
      const labels = state.get('labels').delete(labelIdToRemove);
      return state.merge({ allLabels, labels });
    }
    case Thread.REMOVE_LABELID_THREADS: {
      const { labelIdToRemove } = action;
      const allLabels = state.get('allLabels').delete(labelIdToRemove);
      const labels = state.get('labels').delete(labelIdToRemove);
      return state.merge({ allLabels, labels });
    }
    case Thread.UPDATE_EMAILIDS_THREAD: {
      const { emailIdToAdd, emailIdsToRemove, emailIds } = action;
      if (emailIds) {
        return state.set('emailIds', List(emailIds));
      }
      let newEmailIds = state.get('emailIds');
      if (emailIdsToRemove) {
        newEmailIds = newEmailIds.filter(
          emailId => !emailIdsToRemove.includes(emailId)
        );
      }
      if (emailIdToAdd) {
        newEmailIds = newEmailIds.push(emailIdToAdd);
      }
      return state.set('emailIds', newEmailIds);
    }
    case Thread.UPDATE_THREAD:
    case Thread.UPDATE_THREADS: {
      const { status, unread } = action;
      return state.merge({
        status: typeof status === 'number' ? status : state.get('status'),
        unread: typeof unread === 'boolean' ? unread : state.get('unread')
      });
    }
    default:
      return state;
  }
};

export default mailbox;
