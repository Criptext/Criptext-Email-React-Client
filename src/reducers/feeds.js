import * as Types from '../actions/types';
import { List, Map } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Feed.ADD_BATCH:
      const feeds = action.feeds.map(feed => {
        return Map(feed);
      });
      return state.concat(List(feeds));
    case Types.Feed.SELECT:
      const index = state
      .findIndex(feed => feed.get("id")===action.selectedFeed);
      const newFeeds = state
      .update(index, feed => {
        return feed.set("unread", false);
      });
      return newFeeds;
    default:
      return state;
  }
};
