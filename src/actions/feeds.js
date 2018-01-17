import * as Types from './types';

export const addFeeds = feeds => {
  return {
    type: Types.Feed.ADD_BATCH,
    feeds: feeds
  };
};

export const selectFeed = feedId => {
  return {
    type: Types.Feed.SELECT,
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
      console.log(e);
    }
  };
};
