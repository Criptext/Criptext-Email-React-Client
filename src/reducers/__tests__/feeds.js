/* eslint-env node, jest */

import feedsReducer from '../feeds';
import * as actions from '../../actions/index';

describe('feed actions', () => {
  
  const feeds = [
    {
      "cmd": 1,
      "title": "Schedule email sent",
      "subtitle": "Why we all should flate text",
      "time": 1515794888909,
      "state": "new",
      "unread": true,
      "threadId": 532322,
      "id": 6
    },
    {
      "cmd": 1,
      "title": "Schedule email sent",
      "subtitle": "Why we all should flate text",
      "time": 1515794888909,
      "state": "new",
      "unread": true,
      "threadId": 532322,
      "id": 7
    }
  ];

  function initState(feeds) {
    return feedsReducer(undefined, actions.addFeeds(feeds));
  }

  it('should add feeds to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });

  it('should not set feed as read', () => {
    const state = initState(feeds);
    const action = actions.selectFeed(9);
    const newState = feedsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set feed as read', () => {
    const state = initState(feeds);
    const action = actions.selectFeed(6);
    const newState = feedsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

});