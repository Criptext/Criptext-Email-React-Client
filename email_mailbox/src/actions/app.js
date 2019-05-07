import { App } from './types';
import {
  addAccounts,
  addContacts,
  addFeedItems,
  addLabels,
  addThreads,
  stopLoadThread,
  updateBadgeLabels
} from './index';
import { loadAccounts } from './../utils/AccountUtils';
import { defineLabels } from './../utils/LabelUtils';
import { defineThreads } from './../utils/ThreadUtils';
import { defineFeedItems } from './../utils/FeedItemUtils';
import { getGroupEvents } from './../utils/electronEventInterface';
import { LabelType } from './../utils/electronInterface';
const INIT_LIMIT_THREADS = 22;

export const addDataApp = ({
  account,
  activity,
  contact,
  email,
  file,
  feeditem,
  label,
  thread
}) => ({
  type: App.ADD_DATA,
  account,
  activity,
  contact,
  email,
  file,
  feeditem,
  label,
  thread
});

export const loadApp = params => {
  return async dispatch => {
    const accounts = await loadAccounts();
    const labels = await defineLabels();
    const { threads, contacts } = await defineThreads({
      ...params,
      limit: INIT_LIMIT_THREADS
    });
    const feeditems = await defineFeedItems();

    const account = addAccounts(accounts);
    const activity = stopLoadThread();
    const contact = addContacts(contacts);
    const feeditem = addFeedItems(feeditems, true);
    const label = addLabels(labels);
    const thread = addThreads(params.labelId, threads, true);

    dispatch(addDataApp({ account, activity, contact, label, feeditem, thread }));
    const labelIds = [LabelType.inbox.id, LabelType.spam.id];
    dispatch(updateBadgeLabels(labelIds));
    await getGroupEvents({});
  };
};
