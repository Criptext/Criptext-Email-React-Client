import * as Types from '../actions/types';
import { List, Map } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Feed.ADD_BATCH: {
      const feeds = action.feeds.map(feed => {
        return Map(feed);
      });
      return state.concat(List(feeds));
    }
    case Types.Feed.SELECT: {
      const item = state.find(
        feed => feed.get('id') === action.selectedFeed 
      );
      if ( item !== undefined ) {
        const index = state.findIndex(
          feed => feed.get('id') === action.selectedFeed 
        );
        return state.update(index, feed => {
          return feed.set('unread', false);
        });
      }
      break;
    }
    default:
      return state;
  }
};
