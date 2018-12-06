/* eslint-env node, jest */

import feedItemsReducer from './../feeditems';
import {
  addFeedItems,
  updateFeedItemSuccess,
  removeFeedItemSuccess
} from './../../actions/index';
import json from './../../../public/feeds.json';

jest.mock('./../../utils/const');
jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('Feed actions: ', () => {
  const { feeds } = json;
  const initState = feeds => feedItemsReducer(undefined, addFeedItems(feeds));

  it('Add FeedItems to state', () => {
    expect(initState(feeds)).toMatchSnapshot();
  });

  it('Add feedItems to state. clear: true', () => {
    const prevState = initState(feeds);
    const newFeedItems = {
      0: {
        id: 0,
        date: '2018-08-17T22:11:29.754Z',
        type: '1',
        location: undefined,
        seen: false,
        emailId: 1,
        contactId: 2,
        fileId: undefined,
        isNew: true
      }
    };
    const clear = true;
    const action = addFeedItems(newFeedItems, clear);
    const nextState = feedItemsReducer(prevState, action);
    expect(nextState).toMatchSnapshot();
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
