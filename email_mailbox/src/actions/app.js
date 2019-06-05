import { App } from './types';
import {
  addContacts,
  addFeedItems,
  addLabels,
  addThreads,
  stopLoadThread
} from './index';
import { assembleLabels } from './../utils/LabelUtils';
import { assembleThreads } from './../utils/ThreadUtils';
import { assembleFeedItems } from './../utils/FeedItemUtils';
import { getGroupEvents } from './../utils/electronEventInterface';
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
    const labels = await assembleLabels();
    const { threads, contacts } = await assembleThreads({
      ...params,
      limit: INIT_LIMIT_THREADS
    });
    const feeditems = await assembleFeedItems();

    const activity = stopLoadThread();
    const contact = addContacts(contacts);
    const feeditem = addFeedItems(feeditems, true);
    const label = addLabels(labels);
    const thread = addThreads(params.labelId, threads, true);

    dispatch(addDataApp({ activity, contact, label, feeditem, thread }));
    await getGroupEvents({});
  };
};
