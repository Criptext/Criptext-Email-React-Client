/* eslint-env node, jest */

import labelReducer from './../labels';
import * as actions from '../../actions/index';
import { Map } from 'immutable';
import file from './../../../public/labels.json';
const labels = file.labels;
let store = Map();

jest.mock('../../utils/electronInterface');

describe('Label actions::', () => {
  it('should add labels to state', () => {
    const data = {};
    labels.forEach(element => {
      data[element.id] = {
        id: element.id,
        color: element.color,
        text: element.text
      };
    });
    const action = actions.addLabels(data);
    store = labelReducer(store, action);
    expect(store).toMatchSnapshot();
  });

  it('should modify label: text and color', () => {
    const action = actions.modifyLabel({
      id: 1,
      color: '#000000',
      text: 'labelmodified'
    });
    const state = labelReducer(store, action);
    expect(state).toMatchSnapshot();
  });

  it('should modify label: color', () => {
    const action = actions.modifyLabel({ id: 1, color: '#000000' });
    const state = labelReducer(store, action);
    expect(state).toMatchSnapshot();
  });

  it('should modify label: text', () => {
    const action = actions.modifyLabel({ id: 1, text: 'labelmodified' });
    const state = labelReducer(store, action);
    expect(state).toMatchSnapshot();
  });

  it('should not modify label', () => {
    const action = actions.modifyLabel({
      color: '#000000',
      text: 'labelmodified'
    });
    const state = labelReducer(store, action);
    expect(state).toEqual(store);
  });
});
