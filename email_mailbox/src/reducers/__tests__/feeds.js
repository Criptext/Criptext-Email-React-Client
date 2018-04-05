/* eslint-env node, jest */

import feedsReducer from './../feeds';
import * as actions from './../../actions/index';
import json from './../../../public/feeds.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('Feed actions: ', () => {
  const feeds = json.feeds;

  function initState(feeds) {
    return feedsReducer(undefined, actions.addFeeds(feeds));
  }

  it('Add feeds to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });

  it('Update unread field by feed id', () => {
    const idToSelect = 1;
    const prevState = initState(feeds);
    const action = actions.selectFeed(idToSelect);
    const nextState = feedsReducer(prevState, action);
    expect(nextState).toMatchSnapshot();
  });

  it('Remove feed by id', () => {
    const idToDelete = 3;
    const prevState = initState(feeds);
    const action = actions.removeFeed(idToDelete);
    const nextState = feedsReducer(prevState, action);
    expect(nextState).toMatchSnapshot();
  });
});
