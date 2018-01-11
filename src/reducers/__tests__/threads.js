/* eslint-env node, jest */

import threadsReducer from '../thread';
import * as actions from '../../actions/index';

describe('thread actions', () => {
  const threads = [
    {
      id: 23,
      subject: 'test subject 23',
      preview: 'preview 23',
      date: 1234567890,
      emails: [10, 43]
    }
  ];

  const manyThreads = [
    {
      id: 23,
      subject: 'test subject 23',
      preview: 'preview 23',
      date: 1234567890,
      emails: [10, 43]
    },
    {
      id: 13,
      subject: 'test subject 13',
      preview: 'preview 13',
      date: 1234567891,
      emails: [11, 21]
    }
  ];

  function initState(threads){
    return threadsReducer(undefined, actions.addThreads(threads))
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
    const action = actions.multiSelectThread(23, true);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should add label Starred', () => {
    const state = initState(threads);
    const action = actions.addThreadLabel(23, 1);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should remove label Starred', () => {
    const state = initState(threads);
    const action = actions.removeLabel(23, 1);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set all threads as selected', () => {
    const state = initState(manyThreads);
    const action = actions.selectThreads()
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should set all threads as not selected', () => {
    const state = initState(manyThreads);
    const action = actions.deselectThreads();
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });

  it('should add label 1 to threads', () => {
    const state = initState(manyThreads);
    const action = actions.addThreadsLabel([23, 13], 1);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });
});
