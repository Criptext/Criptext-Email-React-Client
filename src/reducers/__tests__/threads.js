/* eslint-env node, jest */

import threadsReducer from '../thread';
import * as actions from '../../actions/index';

describe('thread actions', () => {
  const threads = [
    {
      "participants": "Criptext Info <no-reply@criptext.com>",
      "hasOpenAttachments": false,
      "lastEmailDate": 1515601890000,
      "lastEmailId": "<serial_key>",
      "preview": "Hello again!",
      "subject": "Hello again gaumala!",
      "id": 532322,
      "secure": true,
      "status": 1,
      "timesOpened": 2,
      "timer": 1,
      "totalAttachments": 1,
      "unread": true,
      "emails": [1],
      "labels": [7, 3, 10],
      "selected": false
    }
  ];

  const manyThreads = [
    {
      "participants": "Criptext Info <no-reply@criptext.com>",
      "hasOpenAttachments": false,
      "lastEmailDate": 1515601890000,
      "lastEmailId": "<serial_key>",
      "preview": "Hello again!",
      "subject": "Hello again gaumala!",
      "id": 532322,
      "secure": true,
      "status": 1,
      "timesOpened": 2,
      "timer": 1,
      "totalAttachments": 1,
      "unread": true,
      "emails": [1],
      "labels": [7, 3, 10],
      "selected": false
    },
    {
      "participants": "Pedro Iniguez <pedroi@criptext.com>, Gianni Carlo <giannic@criptext.com>",
      "hasOpenAttachments": false,
      "lastEmailDate": 1512915941000,
      "lastEmailId": "<serial_key>",
      "preview": "Hello!",
      "subject": "Hello gaumala!",
      "id": 63542,
      "secure": false,
      "status": 1,
      "timesOpened": 0,
      "totalAttachments": 4,
      "unread": true,
      "emails": [65, 8 , 9, 14],
      "labels": [10],
      "selected": false
    }
  ];

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
    const action = actions.removeThreadLabel(23, 1);
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

  it('should add label 1 to threads', () => {
    const state = initState(manyThreads);
    const action = actions.addThreadsLabel([23, 13], 1);
    const newState = threadsReducer(state, action);
    expect(newState).toMatchSnapshot();
  });
});
