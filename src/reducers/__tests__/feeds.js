/* eslint-env node, jest */

import feedsReducer from '../feeds';
import * as actions from '../../actions/index';
import json from './../../../public/feeds.json';

describe('feed actions', () => {
  const feeds = json.feeds;

  function initState(feeds) {
    return feedsReducer(undefined, actions.addFeeds(feeds));
  }

  it('should add feeds to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });

  it('should set feed as read', () => {
    const state = initState(feeds);
    const action = actions.selectFeed(2);
    const newState = feedsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should not set feed as read', () => {
    const state = initState(feeds);
    const action = actions.selectFeed(9);
    const newState = feedsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

});
