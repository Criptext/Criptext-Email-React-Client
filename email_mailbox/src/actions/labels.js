import { Label } from './types';
import * as db from '../utils/electronInterface';

export const addLabels = labels => {
  return {
    type: Label.ADD_BATCH,
    labels: labels
  };
};

export const updateLabelSuccess = label => {
  return {
    type: Label.UPDATE_SUCCESS,
    label: label
  };
};

export const addLabel = label => {
  return async dispatch => {
    try {
      const response = await db.createLabel(label);
      const labelId = response[0];
      const labels = {
        [labelId]: {
          id: labelId,
          color: label.color,
          text: label.text,
          type: 'custom'
        }
      };
      dispatch(addLabels(labels));
    } catch (e) {
      //TO DO
    }
  };
};

export const loadLabels = () => {
  return async dispatch => {
    try {
      const response = await db.getAllLabels();
      const labels = response.reduce(
        (result, element) => ({
          ...result,
          [element.id]: element
        }),
        {}
      );
      dispatch(addLabels(labels));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateLabel = ({ id, color, text }) => {
  return async dispatch => {
    try {
      const response = await db.updateLabel({ id, color, text });
      if (response) {
        dispatch(updateLabelSuccess({ id, color, text }));
      }
    } catch (e) {
      // TO DO
    }
  };
};
