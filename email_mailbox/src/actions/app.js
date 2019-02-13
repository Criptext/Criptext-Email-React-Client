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
