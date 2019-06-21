import { FeedItem } from './../actions/types';
import { Map, fromJS } from 'immutable';

const feeditems = (state = new Map(), action) => {
  switch (action.type) {
    case FeedItem.ADD_BATCH: {
      if (action.clear) {
        const feedItems = fromJS(action.feeds);
        const batch = feedItems.map(feedItem => {
          const seen = !!feedItem.get('seen');
          return feedItem.merge({ seen });
        });
        return Map(batch);
      }
      return state.merge(fromJS(action.feeds));
    }
    case FeedItem.REMOVE_SUCCESS: {
      const feedItemId = action.feed.id;
      if (!feedItemId) {
        return state;
      }
      return state.delete(`${feedItemId}`);
    }
    case FeedItem.UPDATE: {
      const feedItemId = action.feed.id;
      if (!feedItemId) {
        return state;
      }
      return state.set(
        `${feedItemId}`,
        feeditem(state.get(`${feedItemId}`), action)
      );
    }
    case FeedItem.UPDATE_FEED_ITEMS: {
      const { ids, seen } = action.feed;
      return ids.reduce((state, id) => {
        return state.merge({
          [`${id}`]: feeditem(state.get(`${id}`), {
            type: FeedItem.UPDATE,
            feed: { id, seen }
          })
        });
      }, state);
    }
    default:
      return state;
  }
};

const feeditem = (state, action) => {
  switch (action.type) {
    case FeedItem.UPDATE: {
      const { seen } = action.feed;
      return state.merge(
        Map({
          seen: typeof seen === 'boolean' ? seen : state.get('seen')
        })
      );
    }
    default:
      return state;
  }
};

export default feeditems;
