import { Feed, Thread } from './types';

export const addFeeds = feeds => {
  return {
    type: Feed.ADD_BATCH,
    feeds: feeds
  };
};

export const muteNotifications = threadId => {
  return {
    type: Thread.MUTE_THREAD,
    targetThread: threadId
  };
};

export const toggleMuteFeed = feedId => {
  return {
    type: Feed.TOGGLE_MUTE,
    targetFeed: feedId
  };
};

export const removeFeed = feedId => {
  return {
    type: Feed.REMOVE,
    targetFeed: feedId
  };
};

export const selectFeed = feedId => {
  return {
    type: Feed.SELECT,
    selectedFeed: feedId
  };
};

export const loadFeeds = () => {
  return async dispatch => {
    try {
      const response = await fetch('/feeds.json');
      const json = await response.json();
      const feeds = json.feeds;
      dispatch(addFeeds(feeds));
    } catch (e) {
      // TO DO
    }
  };
};
