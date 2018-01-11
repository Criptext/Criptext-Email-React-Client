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

  it('should add threads to state', () => {
    const threads = [
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
    const action = actions.addThreads(threads);
    const state = threadsReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });

  it('should set thread as read', () => {
    const action = actions.addThreads(threads);
    const state = threadsReducer(undefined, action);
    const actionSelect = actions.selectThread(0);
    const newState = threadsReducer(state, actionSelect);
    expect(newState).toMatchSnapshot();
  });

  it('should set thread as selected', () => {
    const action = actions.addThreads(threads);
    const state = threadsReducer(undefined, action);
    const actionSelect = actions.multiSelectThread(23, true);
    const newState = threadsReducer(state, actionSelect);
    expect(newState).toMatchSnapshot();
  });

  it('should add label Starred', () => {
    const action = actions.addThreads(threads);
    const state = threadsReducer(undefined, action);
    const actionSelect = actions.addLabel(23, 'Starred');
    const newState = threadsReducer(state, actionSelect);
    expect(newState).toMatchSnapshot();
  });

  it('should remove label Starred', () => {
    const action = actions.addThreads(threads);
    const state = threadsReducer(undefined, action);
    const actionSelect = actions.removeLabel(23, 'Starred');
    const newState = threadsReducer(state, actionSelect);
    expect(newState).toMatchSnapshot();
  });
});
