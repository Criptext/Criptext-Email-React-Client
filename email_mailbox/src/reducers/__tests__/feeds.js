/* eslint-env node, jest */

import feedsReducer from '../feeds';
import * as actions from '../../actions/index';
import json from './../../../public/feeds.json';

jest.mock('../../utils/electronInterface');

describe('feed actions', () => {
  const feeds = json.feeds;

  function initState(feeds) {
    return feedsReducer(undefined, actions.addFeeds(feeds));
  }

  it('should add feeds to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });
});
