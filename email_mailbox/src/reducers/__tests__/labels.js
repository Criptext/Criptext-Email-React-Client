/* eslint-env node, jest */

import labelReducer from './../labels';
import * as actions from './../../actions/index';
import { Map } from 'immutable';
import file from './../../../public/labels.json';

jest.mock('./../../utils/const');
jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

const myLabels = file.labels;

function initState(labels) {
  const data = labels.reduce(
    (result, element) => ({
      ...result,
      [element.id]: element
    }),
    {}
  );
  return labelReducer(undefined, actions.addLabels(data));
}

describe('Label actions - ADD_BATCH', () => {
  const labels = [myLabels[0]];

  it('should add labels to state', () => {
    expect(initState(labels)).toMatchSnapshot();
  });
});

describe('Label actions - UPDATE', () => {
  const labels = [myLabels[0]];

  it('should update label: text, color, visible, badge', () => {
    const state = initState(labels);
    const badge = 10;
    const color = '#000000';
    const text = 'labelmodified';
    const visible = false;
    const action = actions.updateLabelSuccess({
      id: 1,
      badge,
      color,
      text,
      visible
    });
    const newState = labelReducer(state, action);
    const labelUpdated = newState.get('1');
    expect(labelUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        color,
        text,
        visible
      })
    );
  });

  it('should update label: badge', () => {
    const state = initState(labels);
    const badge = 0;
    const action = actions.updateLabelSuccess({
      id: 1,
      badge
    });
    const newState = labelReducer(state, action);
    const labelUpdated = newState.get('1');
    expect(labelUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        badge
      })
    );
  });

  it('should not update label: id not exist', () => {
    const state = initState(labels);
    const color = '#000000';
    const text = 'labelmodified';
    const action = actions.updateLabelSuccess({
      color,
      text
    });
    const newState = labelReducer(state, action);
    const labelUpdated = newState.get('1');
    expect(labelUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        color: `#${labels[0].color}`,
        text: labels[0].text
      })
    );
  });

  it('should not update label: badge is not type of number and visible is not typeof true', () => {
    const state = initState(labels);
    const badge = '1';
    const visible = 'true';
    const action = actions.updateLabelSuccess({
      id: 1,
      badge,
      visible
    });
    const newState = labelReducer(state, action);
    const labelUpdated = newState.get('1');
    expect(labelUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        badge: labels[0].badge,
        visible: !!labels[0].visible
      })
    );
  });

  it('should remove label', () => {
    const state = initState(labels);
    const labelId = '1';
    const action = actions.removeLabelOnSuccess(labelId);
    const newState = labelReducer(state, action);
    expect(newState).toBe(new Map({}));
  });

  it('should remove labels by labelIds', () => {
    const state = initState(myLabels);
    const labelIds = [1, 6];
    const action = actions.removeLabels(labelIds);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size - 2);
  });

  it('should not modify state if labels been removed do not exist', () => {
    const state = initState(myLabels);
    const labelIds = [25];
    const action = actions.removeLabels(labelIds);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size);
  });
});

describe('Label actions - REMOVE', () => {
  const labels = [myLabels[0]];

  it('should remove label', () => {
    const state = initState(labels);
    const labelId = '1';
    const action = actions.removeLabelOnSuccess(labelId);
    const newState = labelReducer(state, action);
    expect(newState).toBe(new Map({}));
  });
});

describe('Label actions - REMOVE_LABELS', () => {
  it('should remove labels by labelIds', () => {
    const state = initState(myLabels);
    const labelIds = [1, 6];
    const action = actions.removeLabels(labelIds);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size - 2);
  });

  it('should not modify state if labels been removed do not exist', () => {
    const state = initState(myLabels);
    const labelIds = [25];
    const action = actions.removeLabels(labelIds);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size);
  });
});

describe('Label actions - UPDATE_LABELS', () => {
  it('should update labels 6 and 10 name', () => {
    const state = initState(myLabels);
    const updatedLabels = [{ id: 6, text: 'star' }, { id: 10, text: 'test' }];
    const action = actions.updateLabels(updatedLabels);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size);

    const labelUpdated1 = newState.get('6');
    const labelUpdated2 = newState.get('10');

    expect(labelUpdated1.toJS().text).toBe('star');
    expect(labelUpdated2.toJS().text).toBe('test');
  });

  it('should update label 6 and not create label if not exist', () => {
    const state = initState(myLabels);
    const updatedLabels = [
      { id: 6, text: 'star' },
      { id: 7, text: 'important' }
    ];
    const action = actions.updateLabels(updatedLabels);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(state.size);
    expect(newState.has('7')).toBe(false);
    const labelUpdated = newState.get('6');
    expect(labelUpdated.toJS().text).toBe('star');
  });
});
