import * as Types from './types';

export const addFeeds = feeds => {
  return {
    type: Types.Feed.ADD_BATCH,
    feeds: feeds
  };
};

export const loadFeeds = () => {
  return async dispatch => {
    try {
      const response = await fetch('/feeds.json');
      const json = await response.json();
      let feeds = json.feeds;
      dispatch(addFeeds(feeds));
    } catch (e) {
      console.log(e);
    }
  };
};
