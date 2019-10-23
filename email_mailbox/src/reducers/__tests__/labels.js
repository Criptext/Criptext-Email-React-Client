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

  it('should remove group of label', () => {
    const state = initState(myLabels);
    const labelIds = ['1', '6'];
    const action = actions.removeLabels(labelIds);
    const newState = labelReducer(state, action);
    expect(newState.size).toBe(5);
  });
});
