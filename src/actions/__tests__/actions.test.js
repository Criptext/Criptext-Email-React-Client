/* eslint-env node, jest */

import * as actions from '../index';
import * as types from '../ActionTypes';

describe('actions', () => {
  it('should create an action to add all threads', () => {
    const threads = {
      '23': {
        id: 23,
        subject: 'test subject 23',
        emails: [10, 43]
      },
      '13': {
        id: 13,
        subject: 'test subject 13',
        emails: [11, 21]
      }
    };
    const expectedAction = {
      type: types.Thread.ADD_BATCH,
      threads: threads
    };
    expect(actions.addThreads(threads)).toEqual(expectedAction);
  });
});
