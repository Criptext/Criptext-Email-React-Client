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
import { assembleAccounts } from './../utils/AccountUtils';
import { assembleLabels } from './../utils/LabelUtils';
import { assembleThreads } from './../utils/ThreadUtils';
import { assembleFeedItems } from './../utils/FeedItemUtils';
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
    const accounts = await assembleAccounts();
    const labels = await assembleLabels();
    const { threads, contacts } = await assembleThreads({
      ...params,
      limit: INIT_LIMIT_THREADS
    });
    const feeditems = await assembleFeedItems();

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
