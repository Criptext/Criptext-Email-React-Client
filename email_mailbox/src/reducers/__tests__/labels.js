/* eslint-env node, jest */

import labelReducer from './../labels';
import * as actions from './../../actions/index';
import { Map } from 'immutable';
import file from './../../../public/labels.json';
const labels = file.labels;

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('Label actions:', () => {
  it('should add labels', () => {
    const data = {};
    labels.forEach(element => {
      data[element.id] = {
        id: element.id,
        color: element.color,
        text: element.text
      };
    });
    const action = actions.addLabels(data);
    const state = labelReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });

  it('should update label: text and color', () => {
    const data = Map({
      [labels[0].id]: Map({
        id: labels[0].id,
        color: labels[0].color,
        text: labels[0].text
      })
    });
    const action = actions.updateLabelSuccess({
      id: 1,
      color: '#000000',
      text: 'labelmodified'
    });
    const state = labelReducer(data, action);
    expect(state).toMatchSnapshot();
  });

  it('should update label: color', () => {
    const data = Map({
      [labels[0].id]: Map({
        id: labels[0].id,
        color: labels[0].color,
        text: labels[0].text
      })
    });
    const action = actions.updateLabelSuccess({ id: 1, color: '#000000' });
    const state = labelReducer(data, action);
    expect(state).toMatchSnapshot();
  });

  it('should update label: text', () => {
    const data = Map({
      [labels[0].id]: Map({
        id: labels[0].id,
        color: labels[0].color,
        text: labels[0].text
      })
    });
    const action = actions.updateLabelSuccess({ id: 1, text: 'labelmodified' });
    const state = labelReducer(data, action);
    expect(state).toMatchSnapshot();
  });

  it('should not update label', () => {
    const data = Map({
      [labels[0].id]: Map({
        id: labels[0].id,
        color: labels[0].color,
        text: labels[0].text
      })
    });
    const action = actions.updateLabelSuccess({
      color: '#000000',
      text: 'labelmodified'
    });
    const state = labelReducer(data, action);
    expect(state).toEqual(data);
  });
});
