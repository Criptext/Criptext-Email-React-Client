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
          type: 'custom',
          visible: label.visible
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
      const rejectedLabelIds = [db.LabelType.spam.id, db.LabelType.trash.id];
      const unreadInbox = await db.getEmailsUnredByLabelId({
        labelId: db.LabelType.inbox.id,
        rejectedLabelIds
      });
      const badgeInbox = unreadInbox.length;
      const unreadSpam = await db.getEmailsUnredByLabelId({
        labelId: db.LabelType.spam.id
      });
      const badgeSpam = unreadSpam.length;
      const badgeDraft = await db.getEmailsCounterByLabelId(
        db.LabelType.draft.id
      );
      const labels = response.reduce(
        (result, element) => ({
          ...result,
          [element.id]: element
        }),
        {}
      );
      labels[db.LabelType.inbox.id].badge = badgeInbox;
      labels[db.LabelType.spam.id].badge = badgeSpam;
      labels[db.LabelType.draft.id].badge = badgeDraft[0].count;
      dispatch(addLabels(labels));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateLabel = ({ id, color, text, visible }) => {
  return async dispatch => {
    try {
      const response = await db.updateLabel({ id, color, text, visible });
      if (response) {
        dispatch(updateLabelSuccess({ id, color, text, visible }));
      }
    } catch (e) {
      // TO DO
    }
  };
};

export const removeLabel = id => {
  return async dispatch => {
    try {
      const response = await db.deleteLabelById(id);
      if (response) {
        dispatch(removeLabelOnSuccess(id));
      }
    } catch (e) {
      // TO DO
    }
  };
};

export const removeLabelOnSuccess = labelId => {
  return {
    type: Label.REMOVE_SUCCESS,
    labelId
  };
};
