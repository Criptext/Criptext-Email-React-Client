import * as Types from '../actions/types';
import { List, Map } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Feed.ADD_BATCH:
      const feeds = action.feeds.map(feed => {
      	return Map(feed);
      });
      return state.concat(List(feeds));
    default:
      return state;
  }
};