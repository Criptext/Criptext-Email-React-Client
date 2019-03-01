/* eslint-env node, jest */

import threadsReducer from './../threads';
import * as actions from './../../actions/index';
import file from './../../../public/threads.json';

jest.mock('./../../utils/const');
jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

const myThreads = file.threads;

function initState(labelId, threads) {
  return threadsReducer(undefined, actions.addThreads(labelId, threads));
}

describe('Thread actions - ADD_BATCH', () => {
  const manyThreads = [myThreads[0], myThreads[1]];
  const labelId = 1;

  it('should add threads to state', () => {
    expect(initState(labelId, manyThreads)).toMatchSnapshot();
  });
});

describe('Thread actions - ADD_LABELID_THREAD', () => {
  const threads = [myThreads[0]];

  it('should update thread params: allLabels and labels', () => {
    const labelId = 1;
    const state = initState(labelId, threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelIdToAdd = 5;
    const action = actions.addLabelIdThreadSuccess(
      labelId,
      threadId,
      labelIdToAdd
    );
    const newState = threadsReducer(state, action);
    const threadUpdated = newState
      .get(`${labelId}`)
      .get('list')
      .get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 5],
        labels: [2, 3, 5]
      })
    );
    const allIds = newState.get(`${labelId}`).get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: allLabels and labels, when threadId is undefined', () => {
    const labelId = 1;
    const state = initState(labelId, threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelIdToAdd = undefined;
    const action = actions.addLabelIdThreadSuccess(
      labelId,
      threadId,
      labelIdToAdd
    );
    const newState = threadsReducer(state, action);
    const threadUpdated = newState
      .get(`${labelId}`)
      .get('list')
      .get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [2, 3]
      })
    );
    const allIds = newState.get(`${labelId}`).get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const labelId = 1;
    const state = initState(labelId, threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelIdToAdd = '4';
    const action = actions.addLabelIdThreadSuccess(
      labelId,
      threadId,
      labelIdToAdd
    );
    const newState = threadsReducer(state, action);
    const threadUpdated = newState
      .get(`${labelId}`)
      .get('list')
      .get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3],
        labels: [2, 3]
      })
    );
    const allIds = newState.get(`${labelId}`).get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
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
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5, 10],
        labels: [10]
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
  });

  it('should not update thread param: allLabels and labels, when uniqueId is not number type', () => {
    const state = initState(threads);
    const uniqueId = '2';
    const labelId = undefined;
    const action = actions.addLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = '4';
    const action = actions.addLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
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
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });

  it('should not update threads param: allLabels and labels, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const labelId = 5;
    const action = actions.addLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
  });

  it('should not update threads param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = '5';
    const action = actions.addLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });
});

describe('Thread actions - MOVE_THREADS', () => {
  const threads = [myThreads[0], myThreads[2]];

  it('should move threads params: threadIds', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.moveThreads(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(1);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['cuW6ElyoqsR7MMh']);
  });

  it('should move threads params: threadIds not exist', () => {
    const state = initState(threads);
    const threadIds = null;
    const action = actions.moveThreads(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(2);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
  });

  it('should move threads params: threadIds is different', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dMlE0OSS9'];
    const action = actions.moveThreads(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(2);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
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
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [4, 2, 3],
        labels: [3, 2]
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: allLabels and labels, when threadId is undefined', () => {
    const state = initState(threads);
    const threadId = undefined;
    const labelId = 1;
    const action = actions.removeLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const labelId = '1';
    const action = actions.removeLabelIdThreadSuccess(threadId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [1, 2, 3, 4],
        labels: [1, 2, 3]
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
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
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [],
        labels: []
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
  });

  it('should not update thread param: allLabels and labels, when uniqueId is not number type', () => {
    const state = initState(threads);
    const uniqueId = '2';
    const labelId = undefined;
    const action = actions.removeLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
  });

  it('should not update thread param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const uniqueId = 2;
    const labelId = '5';
    const action = actions.removeLabelIdThreadDraftSuccess(uniqueId, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    expect(threadUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        allLabels: [5],
        labels: []
      })
    );
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([2]);
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
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });

  it('should not update threads param: allLabels and labels, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const labelId = 1;
    const action = actions.removeLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
  });

  it('should not update threads param: allLabels and labels, when labelId is not number type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh'];
    const labelId = '1';
    const action = actions.removeLabelIdThreadsSuccess(threadIds, labelId);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const threadUpdated2 = newState.get('list').get('1');
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
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });
});

describe('Thread actions - REMOVE_THREADS', () => {
  const threads = [myThreads[0], myThreads[2]];

  it('should remove threads params: threadIds', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.removeThreadsSuccess(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(1);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['cuW6ElyoqsR7MMh']);
  });

  it('should move threads params: threadIds not exist', () => {
    const state = initState(threads);
    const threadIds = null;
    const action = actions.removeThreadsSuccess(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(2);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
  });

  it('should move threads params: threadIds is different', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dMlE0OSS9'];
    const action = actions.removeThreadsSuccess(threadIds);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list');
    expect(threadUpdated.size).toEqual(2);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9', 'cuW6ElyoqsR7MMh']);
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
    const threadUpdated = newState.get('list').get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([2, 4]);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([threadId]);
  });

  it('should update thread param: emailIds, just add', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdToAdd = 4;
    const action = actions.updateEmailIdsThread({ threadId, emailIdToAdd });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2, 4]);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([threadId]);
  });

  it('should update thread param: emailIds, just remove', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdsToRemove = [1];
    const action = actions.updateEmailIdsThread({ threadId, emailIdsToRemove });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([2]);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([threadId]);
  });

  it('should update thread param: emailIds', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIds = [100, 200, 300];
    const action = actions.updateEmailIdsThread({ threadId, emailIds });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const emailIdsUpdated = threadUpdated.get('emailIds').toJS();
    expect(emailIdsUpdated).toEqual(emailIds);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([threadId]);
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
    const threadUpdated = newState.get('list').get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2]);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: emailIds, when emailIdToAdd and emailIdToRemove are undefined', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const action = actions.updateEmailIdsThread({ threadId });
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const emailIds = threadUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2]);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual([threadId]);
  });

  it('should remove thread param: emailIds', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdsToRemove = [1, 2];
    const action = actions.updateEmailIdsThread({ threadId, emailIdsToRemove });
    const newState = threadsReducer(state, action);
    const listUpdated = newState.get('list');
    expect(listUpdated.size).toEqual(0);
    const allIds = newState.get('allIds');
    expect(allIds.size).toEqual(0);
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
    const threadUpdated = newState.get('list').get('0');
    const status = threadUpdated.get('status');
    expect(status).toBe(newStatus);
  });

  it('should not update thread param: status when status is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const newStatus = '1';
    const action = actions.updateStatusThread(threadId, newStatus);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const status = threadUpdated.get('status');
    expect(status).not.toBe(newStatus);
    expect(status).toBe(0);
  });
});

describe('Thread actions - UPDATE_UNREAD_THREADS', () => {
  const threads = [myThreads[0]];

  it('should update thread param: unread', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.updateUnreadThreadsSuccess(threadIds, false);
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(false);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });

  it('should not update thread param: unread, when unread is not bool type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'false');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(threadIds);
  });

  it('should not update thread param: unread, when threadIds is empty', () => {
    const state = initState(threads);
    const threadIds = [];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });

  it('should not update thread param: unread, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const threadUpdated = newState.get('list').get('0');
    const unread = threadUpdated.get('unread');
    expect(unread).toBe(true);
    const allIds = newState.get('allIds');
    expect(Array.from(allIds)).toEqual(['6Za2dcMlE0OSSc9']);
  });
});
