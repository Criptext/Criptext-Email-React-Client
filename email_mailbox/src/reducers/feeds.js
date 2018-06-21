import { Feed } from '../actions/types';
import { List, fromJS } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Feed.ADD_BATCH: {
      return fromJS(action.feeds);
    }
    case Feed.SELECT: {
      const item = state.find(feed => feed.get('id') === action.selectedFeed);
      if (item !== undefined) {
        const index = state.findIndex(
          feed => feed.get('id') === action.selectedFeed
        );
        return state.update(index, feed => {
          return feed.set('unread', 0);
        });
      }
      return state;
    }
    case Feed.REMOVE: {
      return state.filter(feed => feed.get('id') !== action.targetFeed);
    }
    default:
      return state;
  }
};
