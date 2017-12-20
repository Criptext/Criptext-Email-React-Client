/* eslint-env node, jest */

import threadsReducer from '../thread';
import * as actions from '../../actions/index';

describe('actions', () => {
  it('should create an', () => {
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
    const action = actions.addThreads(threads);
    const state = threadsReducer(null, action);
    expect(state).toMatchSnapshot();
  });
});
