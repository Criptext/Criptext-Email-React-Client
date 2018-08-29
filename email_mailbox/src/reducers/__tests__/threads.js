/* eslint-env node, jest */

import threadsReducer from './../threads';
import * as actions from './../../actions/index';
import file from './../../../public/threads.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');
jest.mock('./../../utils/electronUtilsInterface');

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
    const emailUpdated = newState.get('0');
    const emailIds = emailUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([2, 4]);
  });

  it('should update thread param: emailIds, just add', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdToAdd = 4;
    const action = actions.updateEmailIdsThread({ threadId, emailIdToAdd });
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const emailIds = emailUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2, 4]);
  });

  it('should update thread param: emailIds, just remove', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const emailIdsToRemove = [1];
    const action = actions.updateEmailIdsThread({ threadId, emailIdsToRemove });
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const emailIds = emailUpdated.get('emailIds').toJS();
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
    const emailUpdated = newState.get('0');
    const emailIds = emailUpdated.get('emailIds').toJS();
    expect(emailIds).toEqual([1, 2]);
  });

  it('should not update thread param: emailIds, when emailIdToAdd and emailIdToRemove are undefined', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const action = actions.updateEmailIdsThread({ threadId });
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const emailIds = emailUpdated.get('emailIds').toJS();
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
    const emailUpdated = newState.get('0');
    const unread = emailUpdated.get('unread');
    expect(unread).toBe(false);
  });

  it('should not update thread param: unread, when unread is not bool type', () => {
    const state = initState(threads);
    const threadIds = ['6Za2dcMlE0OSSc9'];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'false');
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const unread = emailUpdated.get('unread');
    expect(unread).toBe(true);
  });

  it('should not update thread param: unread, when threadIds is empty', () => {
    const state = initState(threads);
    const threadIds = [];
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const unread = emailUpdated.get('unread');
    expect(unread).toBe(true);
  });

  it('should not update thread param: unread, when threadIds is undefined', () => {
    const state = initState(threads);
    const threadIds = undefined;
    const action = actions.updateUnreadThreadsSuccess(threadIds, 'true');
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const unread = emailUpdated.get('unread');
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
    const emailUpdated = newState.get('0');
    const status = emailUpdated.get('status');
    expect(status).toBe(newStatus);
  });

  it('should not update thread param: status when status is not number type', () => {
    const state = initState(threads);
    const threadId = '6Za2dcMlE0OSSc9';
    const newStatus = '1';
    const action = actions.updateStatusThread(threadId, newStatus);
    const newState = threadsReducer(state, action);
    const emailUpdated = newState.get('0');
    const status = emailUpdated.get('status');
    expect(status).not.toBe(newStatus);
    expect(status).toBe(0);
  });
});
