import { Activity, FeedItem } from './../actions/types';
import { Map, fromJS } from 'immutable';

const initFeedItems = Map({
  badge: 0,
  list: Map({})
});

const feeditems = (state = initFeedItems, action) => {
  switch (action.type) {
    case FeedItem.ADD_BATCH:
    case FeedItem.UPDATE_FEED_ITEMS: {
      const { badge } = action;
      return state.merge({
        badge,
        list: list(state.get('list'), action)
      });
    }
    case Activity.LOGOUT:
      return initFeedItems;
    case FeedItem.REMOVE_SUCCESS:
    case FeedItem.UPDATE: {
      return state.merge({ list: list(state.get('list'), action) });
    }
    default:
      return state;
  }
};

const list = (state, action) => {
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
            type: action.type,
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
    case FeedItem.UPDATE:
    case FeedItem.UPDATE_FEED_ITEMS: {
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
