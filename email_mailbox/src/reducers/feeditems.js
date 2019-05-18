import { Activity, FeedItem } from './../actions/types';
import { Map, fromJS } from 'immutable';

const feeditems = (state = new Map({}), action) => {
  switch (action.type) {
    case FeedItem.ADD_BATCH: {
      if (action.clear) {
        return Map(fromJS(action.feeds));
      }
      return state.merge(fromJS(action.feeds));
    }
    case Activity.LOGOUT:
      return new Map({});
    case FeedItem.REMOVE_SUCCESS: {
      const feedItemId = action.feed.id;
      if (!feedItemId) {
        return state;
      }
      return state.delete(`${feedItemId}`);
    }
    case FeedItem.UPDATE_SUCCESS: {
      const feedItemId = action.feed.id;
      if (!feedItemId) {
        return state;
      }
      return state.set(
        `${feedItemId}`,
        feeditem(state.get(`${feedItemId}`), action)
      );
    }
    case FeedItem.UPDATE_ALL: {
      const { field, value } = action;
      return Map(
        state.reduce((result, item, key) => {
          const action = {
            type: FeedItem.UPDATE_SUCCESS,
            feed: { [field]: value }
          };
          result[key] = feeditem(item, action);
          return result;
        }, {})
      );
    }
    default:
      return state;
  }
};

const feeditem = (state, action) => {
  switch (action.type) {
    case FeedItem.UPDATE_SUCCESS: {
      const seen = action.feed.seen || state.get('seen');
      const isNew =
        action.feed.isNew !== undefined
          ? action.feed.isNew
          : state.get('isNew');
      return state.merge(Map({ seen, isNew }));
    }
    default:
      return state;
  }
};

export default feeditems;
