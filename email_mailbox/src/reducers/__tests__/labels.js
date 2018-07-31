/* eslint-env node, jest */

import labelReducer from './../labels';
import * as actions from './../../actions/index';
import { Map } from 'immutable';
import file from './../../../public/labels.json';
const labels = file.labels;
const label = labels[0];

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
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
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
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
      })
    });
    const action = actions.updateLabelSuccess({ id: 1, color: '#000000' });
    const state = labelReducer(data, action);
    expect(state).toMatchSnapshot();
  });

  it('should update label: text', () => {
    const data = Map({
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
      })
    });
    const action = actions.updateLabelSuccess({ id: 1, text: 'labelmodified' });
    const state = labelReducer(data, action);
    expect(state).toMatchSnapshot();
  });

  it('should update label: add badge', () => {
    const data = Map({
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
      })
    });
    const badgeOperation = +1;
    const action = actions.updateLabelSuccess({ id: 1, badgeOperation });
    const state = labelReducer(data, action);
    expect(state.get('1').get('badge')).toEqual(2);
  });

  it('should update label: less badge', () => {
    const data = Map({
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
      })
    });
    const badgeOperation = -1;
    const action = actions.updateLabelSuccess({ id: 1, badgeOperation });
    const state = labelReducer(data, action);
    expect(state.get('1').get('badge')).toEqual(0);
  });

  it('should not update label', () => {
    const data = Map({
      [label.id]: Map({
        id: label.id,
        color: label.color,
        text: label.text,
        badge: label.badge
      })
    });
    const action = actions.updateLabelSuccess({
      color: '#000000',
      text: 'labelmodified'
    });
    const state = labelReducer(data, action);
    expect(state).toEqual(data);
  });

  it('should remove label', () => {
    const labelId = '0';
    const data = Map({
      [labelId]: Map({
        id: labelId,
        color: '#000',
        text: 'ToRemove',
        badge: 0,
        visible: false
      })
    });
    const emptyState = new Map({});
    const action = actions.removeLabelOnSuccess(labelId);
    const state = labelReducer(data, action);
    expect(state).toBe(emptyState);
  });
});
