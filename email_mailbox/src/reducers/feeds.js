import { Feed } from '../actions/types';
import { List, Map } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Feed.ADD_BATCH: {
      const feeds = action.feeds.map(feed => {
        return Map(feed);
      });
      return state.concat(List(feeds));
    }
    case Feed.SELECT: {
      const item = state.find(feed => feed.get('id') === action.selectedFeed);
      if (item !== undefined) {
        const index = state.findIndex(
          feed => feed.get('id') === action.selectedFeed
        );
        return state.update(index, feed => {
          return feed.set('unread', false);
        });
      }
      return state;
    }
    case Feed.REMOVE: {
      const filteredFeeds = state.filter(feed => {
        return feed.get('id') !== action.targetFeed;
      });
      return filteredFeeds;
    }
    case Feed.TOGGLE_MUTE: {
      const item = state.find(feed => feed.get('id') === action.targetFeed);
      if (item !== undefined) {
        const index = state.findIndex(
          feed => feed.get('id') === action.targetFeed
        );
        return state.update(index, feed => {
          const prevMutedState = feed.get('isMuted');
          return feed.set('isMuted', !prevMutedState);
        });
      }
      return state;
    }
    default:
      return state;
  }
};
