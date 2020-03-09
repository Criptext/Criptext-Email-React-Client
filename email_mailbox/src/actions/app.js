import { App } from './types';
import {
  addContacts,
  addFeedItems,
  addLabels,
  addThreads,
  stopLoadThread,
  updateBadgeAccounts,
  updateBadgeLabels
} from './index';
import { defineLabels } from './../utils/LabelUtils';
import { defineThreads } from './../utils/ThreadUtils';
import { defineFeedItems } from './../utils/FeedItemUtils';
import { getGroupEvents } from './../utils/electronEventInterface';
import { LabelType } from './../utils/electronInterface';
const INIT_LIMIT_THREADS = 22;

export const addDataApp = ({
  activity,
  contact,
  email,
  file,
  feeditem,
  label,
  thread
}) => ({
  type: App.ADD_DATA,
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
    const labels = await defineLabels();
    const { threads, contacts } = await defineThreads({
      ...params,
      limit: INIT_LIMIT_THREADS
    });
    const { feedItems, badge } = await defineFeedItems();
    const activity = stopLoadThread();
    const contact = addContacts(contacts);
    const feeditem = addFeedItems(feedItems, badge, true);
    const label = addLabels(labels);
    const thread = addThreads(params.labelId, threads, true);

    dispatch(addDataApp({ activity, contact, label, feeditem, thread }));
    const labelIds = [LabelType.inbox.id, LabelType.spam.id];
    dispatch(updateBadgeLabels(labelIds));
    dispatch(updateBadgeAccounts());
    await getGroupEvents({});
  };
};
