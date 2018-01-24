/* eslint-env node, jest */

import threadsReducer from '../thread';
import * as actions from '../../actions/index';
import file from './../../../public/threads.json';

jest.mock('../../utils/electronInterface');

const myThreads = file.threads;

describe('thread actions', () => {
  const threads = [myThreads[0]];
  const manyThreads = [myThreads[0], myThreads[1]];

  function initState(threads) {
    return threadsReducer(undefined, actions.addThreads(threads));
  }

  it('should add threads to state', () => {
    expect(initState(manyThreads)).toMatchSnapshot();
  });

  it('should set thread as read', () => {
    const state = initState(threads);
    const action = actions.selectThread(0);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set thread as selected', () => {
    const state = initState(threads);
    const action = actions.multiSelectThread(5, true);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should add label 9', () => {
    const state = initState(threads);
    const action = actions.addThreadLabel(18, 9);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should remove label 7', () => {
    const state = initState(threads);
    const action = actions.removeThreadLabel(5, 7);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set all threads as selected', () => {
    const state = initState(manyThreads);
    const action = actions.selectThreads();
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set all threads as not selected', () => {
    const state = initState(manyThreads);
    const action = actions.deselectThreads();
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should add label 6 to threads', () => {
    const state = initState(manyThreads);
    const action = actions.addThreadsLabel([5, 18], 6);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });
});
