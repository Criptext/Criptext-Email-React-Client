/* eslint-env node, jest */

import labelReducer from './../labels';
import * as actions from '../../actions/index';

jest.mock('../../utils/electronInterface');

describe('label actions: ', () => {
  it('should add labels to state', () => {
    const labels = {
      '1': {
        id: 1,
        text: 'label 1'
      },
      '2': {
        id: 2,
        text: 'label 2'
      }
    };
    const action = actions.addLabels(labels);
    const state = labelReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
