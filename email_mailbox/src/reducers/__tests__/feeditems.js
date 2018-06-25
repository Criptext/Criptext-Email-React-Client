/* eslint-env node, jest */

import feedItemsReducer from './../feeditems';
import {
  addFeedItems,
  updateFeedItemSuccess,
  removeFeedItemSuccess
} from './../../actions/index';
import json from './../../../public/feeds.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('Feed actions: ', () => {
  const { feeds } = json;
  const initState = feeds => feedItemsReducer(undefined, addFeedItems(feeds));

  it('Add FeedItems to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });

  it('Update field by FeedItem id', () => {
    const idToUpdate = 1;
    const prevState = initState(feeds);
    const action = updateFeedItemSuccess({
      feedItemId: idToUpdate,
      seen: true
    });
    const nextState = feedItemsReducer(prevState, action);
    expect(nextState.get(`${idToUpdate}`).get('seen')).toBe(true);
  });

  it('Remove FeedItem by id', () => {
    const idToDelete = 3;
    const prevState = initState(feeds);
    const action = removeFeedItemSuccess(idToDelete);
    const nextState = feedItemsReducer(prevState, action);
    expect(nextState.get(`${idToDelete}`)).toBe(undefined);
  });
});
