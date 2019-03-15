import { List } from 'immutable';
import { createSelector } from 'reselect';

const getThreadsByMailbox = (state, props) => {
  const mailbox = state.get('threads').get(`${props.mailboxSelected.id}`);
  return mailbox ? mailbox.get('list') : List([]);
};

const getThreadsIdentifier = (state, props) =>
  props.itemsChecked || props.threadIdSelected;

const getUniqueIdsSelected = (state, props) =>
  props.threadsSelected.map(thread => thread.threadIdDB || thread.emailId);

const defineThreadIds = threads => {
  return !threads.size
    ? new Set()
    : new Set(threads.map(thread => thread.get('uniqueId')));
};

const defineThreadsSelected = (threads, identifier) => {
  if (typeof identifier === 'object')
    return defineSomeThreadsSelected(threads, identifier);
  return defineOneThreadSelected(threads, identifier);
};

const defineOneThreadSelected = (threads, threadId) => {
  const thread = threads.find(thread => {
    return thread.get('threadId') === threadId;
  });
  return [
    {
      threadIdDB: thread ? thread.get('threadId') : null
    }
  ];
};

const defineSomeThreadsSelected = (threads, itemsChecked) => {
  return threads
    .filter(thread => itemsChecked.has(thread.get('uniqueId')))
    .toArray()
    .map(thread => ({
      threadIdDB: thread.get('threadId'),
      emailId: !thread.get('threadId') ? thread.get('id') : null
    }));
};

const defineLabelIdsFromThreads = (threads, uniqueIds) => {
  return threads
    .filter(thread => uniqueIds.includes(thread.get('uniqueId')))
    .reduce((result, thread) => {
      const labels = thread.get('labels').toArray();
      return [...result, ...labels];
    }, []);
};

export const makeGetThreadsSelected = () => {
  return createSelector(
    [getThreadsByMailbox, getThreadsIdentifier],
    (threads, identifier) => defineThreadsSelected(threads, identifier)
  );
};

export const makeGetThreadIds = () => {
  return createSelector([getThreadsByMailbox], threads =>
    defineThreadIds(threads)
  );
};

export const makeGetLabelIdsFromThreads = () => {
  return createSelector(
    [getThreadsByMailbox, getUniqueIdsSelected],
    (threads, uniqueIdsSelected) =>
      defineLabelIdsFromThreads(threads, uniqueIdsSelected)
  );
};