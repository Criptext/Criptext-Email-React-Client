import { Label } from './types';
import {
  LabelType,
  createLabel,
  postPeerEvent,
  getAllLabels,
  getEmailsUnredByLabelId,
  getEmailsCounterByLabelId,
  updateLabel as updateLabelDB,
  deleteLabelById
} from '../utils/electronInterface';
import { SocketCommand } from '../utils/const';

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

export const addLabel = (label, isByEvent) => {
  return async dispatch => {
    try {
      const [response] = await createLabel(label);
      if (response) {
        const labelId = response;
        const { text, color, visible } = label;
        const labels = {
          [labelId]: {
            id: labelId,
            color,
            text,
            type: 'custom',
            visible
          }
        };
        if (isByEvent) {
          dispatch(addLabels(labels));
        } else {
          const eventParams = {
            cmd: SocketCommand.PEER_LABEL_CREATED,
            params: { color, text }
          };
          await postPeerEvent(eventParams);
          dispatch(addLabels(labels));
        }
      }
    } catch (e) {
      //TO DO
    }
  };
};

export const loadLabels = () => {
  return async dispatch => {
    try {
      const response = await getAllLabels();
      const rejectedLabelIds = [LabelType.spam.id, LabelType.trash.id];
      const unreadInbox = await getEmailsUnredByLabelId({
        labelId: LabelType.inbox.id,
        rejectedLabelIds
      });
      const badgeInbox = unreadInbox.length;
      const unreadSpam = await getEmailsUnredByLabelId({
        labelId: LabelType.spam.id
      });
      const badgeSpam = unreadSpam.length;
      const badgeDraft = await getEmailsCounterByLabelId(LabelType.draft.id);
      const labels = response.reduce(
        (result, element) => ({
          ...result,
          [element.id]: element
        }),
        {}
      );
      labels[LabelType.inbox.id].badge = badgeInbox;
      labels[LabelType.spam.id].badge = badgeSpam;
      labels[LabelType.draft.id].badge = badgeDraft[0].count;
      dispatch(addLabels(labels));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateLabel = ({ id, color, text, visible }) => {
  return async dispatch => {
    try {
      const response = await updateLabelDB({ id, color, text, visible });
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
      const response = await deleteLabelById(id);
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
