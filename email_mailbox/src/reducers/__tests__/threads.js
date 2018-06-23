/* eslint-env node, jest */

import threadsReducer from './../threads';
import * as actions from './../../actions/index';
import file from './../../../public/threads.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

const myThreads = file.threads;

describe('Set thread state by actions', () => {
  const threads = [myThreads[0]];
  const manyThreads = [myThreads[0], myThreads[1]];

  function initState(threads) {
    return threadsReducer(undefined, actions.addThreads(threads));
  }

  it('should add threads to state, action[ADD_BATCH]', () => {
    expect(initState(manyThreads)).toMatchSnapshot();
  });

  it('should set thread param: unread, action[UPDATE_UNREAD_THREAD]', () => {
    const state = initState(threads);
    const params = {
      id: 1,
      unread: false
    };
    const action = actions.updateUnreadThread(params);
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const unread = emailUpdated.get('unread');
    expect(unread).toBe(false);
  });
});
