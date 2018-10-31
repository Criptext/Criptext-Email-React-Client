/* eslint-env node, jest */

import threadsReducer from './../threads';
import * as actions from './../../actions/index';
import file from './../../../public/threads.json';

jest.mock('./../../utils/const');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

const myThreads = file.threads;

function initState(threads) {
  return threadsReducer(undefined, actions.addThreads(threads));
}

describe('Thread actions - ADD_BATCH', () => {
  const manyThreads = [myThreads[0], myThreads[1]];

  it('should add threads to state', () => {
    expect(initState(manyThreads)).toMatchSnapshot();
  });
});

describe('Thread actions - ADD_LABELID_THREAD', () => {
  const threads = [myThreads[0]];

  it('should update thread params: allLabels and labels', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = 5;
    const action = actions.addLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4, 5],
        labels: [1, 2, 3, 5]
      })
    );
  });

  it('should not update thread param: allLabels and labels, when threadId is undefined', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = undefined;
    const action = actions.addLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = '4';
    const action = actions.addLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
  });
});

describe('Thread actions - ADD_LABELID_THREAD_DRAFT', () => {
  const threads = [myThreads[1]];

  it('should update thread params: allLabels and labels', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = 10;
    const action = actions.addLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5, 10],
        labels: [10]
      })
    );
  });

  it('should not update thread param: allLabels and labels, when uniqueId is not number type', () => {
    const state = initState(threads);
    const uniqueId = '2';
    const labelId = undefined;
    const action = actions.addLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = '4';
    const action = actions.addLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
  });
});

describe('Thread actions - ADD_LABELID_THREADS', () => {
  const threads = [myThreads[0], myThreads[2]];

  it('should update threads params: allLabels and labels', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = 5;
    const action = actions.addLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4, 5],
        labels: [1, 2, 3, 5]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 5],
        labels: [1, 2, 5]
      })
    );
  });

  it('should not update threads param: allLabels and labels, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const labelId = 5;
    const action = actions.addLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [1, 2]
      })
    );
  });

  it('should not update threads param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = '5';
    const action = actions.addLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [1, 2]
      })
    );
  });
});

describe('Thread actions - REMOVE_LABELID_THREAD', () => {
  const threads = [myThreads[0]];

  it('should update thread params: allLabels and labels', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = 1;
    const action = actions.removeLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [4, 2, 3],
        labels: [3, 2]
      })
    );
  });

  it('should not update thread param: allLabels and labels, when threadId is undefined', () => {
    const state = initState(threads);
    const threadId = undefined;
    const labelId = 1;
    const action = actions.removeLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = '1';
    const action = actions.removeLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
  });
});

describe('Thread actions - REMOVE_LABELID_THREAD_DRAFT', () => {
  const threads = [myThreads[1]];

  it('should update thread params: allLabels and labels', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = 5;
    const action = actions.removeLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [],
        labels: []
      })
    );
  });

  it('should not update thread param: allLabels and labels, when uniqueId is not number type', () => {
    const state = initState(threads);
    const uniqueId = '2';
    const labelId = undefined;
    const action = actions.removeLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = '5';
    const action = actions.removeLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
  });
});

describe('Thread actions - REMOVE_LABELID_THREADS', () => {
  const threads = [myThreads[0], myThreads[2]];

  it('should update threads params: allLabels and labels', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = 1;
    const action = actions.removeLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [4, 2, 3],
        labels: [3, 2]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [3, 2],
        labels: [2]
      })
    );
  });

  it('should not update threads param: allLabels and labels, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const labelId = 1;
    const action = actions.removeLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [1, 2]
      })
    );
  });

  it('should not update threads param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = '1';
    const action = actions.removeLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const threadUpdated2 = newState.get('1');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    expect(threadUpdated2.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [1, 2]
      })
    );
  });
});

describe('Thread actions - UPDATE_EMAILIDS_THREAD', () => {
  const threads = [myThreads[0]];

  it('should update thread param: emailIds, add and remove', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdToAdd = 4;
    const emailIdsToRemove = [1];
    const action = actions.updateEmailIdsThread({
      threadId,
      emailIdToAdd,
      emailIdsToRemove
    });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([2, 4]);
  });

  it('should update thread param: emailIds, just add', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdToAdd = 4;
    const action = actions.updateEmailIdsThread({ threadId, emailIdToAdd });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2, 4]);
  });

  it('should update thread param: emailIds, just remove', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdsToRemove = [1];
    const action = actions.updateEmailIdsThread({ threadId, emailIdsToRemove });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([2]);
  });

  it('should not update thread param: emailIds, when threadId is undefined', () => {
    const state = initState(threads);
    const threadId = undefined;
    const emailIdToAdd = 4;
    const emailIdsToRemove = 1;
    const action = actions.updateEmailIdsThread({
      threadId,
      emailIdToAdd,
      emailIdsToRemove
    });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2]);
  });

  it('should not update thread param: emailIds, when emailIdToAdd and emailIdToRemove are undefined', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const action = actions.updateEmailIdsThread({ threadId });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2]);
  });
});

describe('Thread actions - UPDATE_UNREAD_THREADS', () => {
  const threads = [myThreads[0]];

  it('should update thread param: unread', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.updateUnreadThreadsSuccess(threadIds, false);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(false);
  });

  it('should not update thread param: unread, when unread is not bool type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'false');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
  });

  it('should not update thread param: unread, when threadIds is empty', () => {
    const state = initState(threads);
    const threadIds = [];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
  });

  it('should not update thread param: unread, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
  });
});

describe('Thread actions - UPDATE_STATUS_THREAD', () => {
  const threads = [myThreads[0]];

  it('should update thread param: status', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const newStatus = 2;
    const action = actions.updateStatusThread(threadId, newStatus);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const status = threadUpdated.get('status');
    expect(status).toBe(newStatus);
  });

  it('should not update thread param: status when status is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const newStatus = '1';
    const action = actions.updateStatusThread(threadId, newStatus);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('0');
    const status = threadUpdated.get('status');
    expect(status).not.toBe(newStatus);
    expect(status).toBe(0);
  });
});
