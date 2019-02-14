import { App } from './types';
import {
  addContacts,
  addFeedItems,
  addLabels,
  addThreads,
  stopLoadThread
} from './index';
import { defineLabels } from './../utils/LabelUtils';
import { defineThreads } from './../utils/ThreadUtils';
import { defineFeedItems } from './../utils/FeedItemUtils';
import { getGroupEvents } from './../utils/electronEventInterface';

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
    const { threads, contacts } = await defineThreads(params);
    const feeditems = await defineFeedItems();

    const activity = stopLoadThread();
    const contact = addContacts(contacts);
    const feeditem = addFeedItems(feeditems, true);
    const label = addLabels(labels);
    const thread = addThreads(threads, true);

    dispatch(addDataApp({ activity, contact, label, feeditem, thread }));
    await getGroupEvents();
  };
};
