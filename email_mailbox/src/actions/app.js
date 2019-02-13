import { App } from './types';
import { defineLabels } from './../utils/LabelUtils';
import { defineThreads } from './../utils/ThreadUtils';
import { defineFeedItems } from './../utils/FeedItemUtils';
import { getGroupEvents } from './../utils/electronEventInterface';

export const addInitDataApp = ({
  contacts,
  feeditems,
  labels,
  threads,
  clear
}) => ({
  type: App.ADD_INIT_DATA,
  contacts,
  feeditems,
  labels,
  threads,
  clear
});

export const loadApp = params => {
  return async dispatch => {
    const labels = await defineLabels();
    const { threads, contacts } = await defineThreads(params);
    const feeditems = await defineFeedItems();
    dispatch(
      addInitDataApp({ contacts, labels, threads, feeditems, clear: true })
    );
    await getGroupEvents();
  };
};
