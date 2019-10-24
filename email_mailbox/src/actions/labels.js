import { Label } from './types';
import { LabelType } from '../utils/electronInterface';
import {
  createLabel,
  deleteLabelById,
  getEmailsCounterByLabelId,
  getEmailsUnredByLabelId,
  postPeerEvent,
  updateDockBadgeApp,
  updateLabel as updateLabelDB
} from '../utils/ipc';
import { sendUpdateLabelsErrorMessage } from './../utils/electronEventInterface';
import { SocketCommand } from '../utils/const';

export const addLabel = label => {
  return async dispatch => {
    try {
      const [labelId] = await createLabel(label);
      if (labelId) {
        const { text, color, visible, uuid } = label;
        const labels = {
          [labelId]: {
            id: labelId,
            color,
            text,
            type: 'custom',
            visible,
            uuid
          }
        };
        const eventParams = {
          cmd: SocketCommand.PEER_LABEL_CREATED,
          params: { text, color, uuid }
        };
        await postPeerEvent(eventParams);
        dispatch(addLabels(labels));
      }
    } catch (e) {
      sendUpdateLabelsErrorMessage();
    }
  };
};

export const addLabels = labels => {
  return {
    type: Label.ADD_BATCH,
    labels
  };
};

export const removeLabels = labelIds => {
  return {
    type: Label.REMOVE_LABELS,
    labelIds
  };
};

export const removeLabel = (id, uuid) => {
  return async dispatch => {
    try {
      const response = await deleteLabelById(id);
      if (!response) return;
      dispatch(removeLabelOnSuccess(id));
      const eventParams = {
        cmd: SocketCommand.PEER_DELETE_LABEL,
        params: { uuid }
      };
      await postPeerEvent(eventParams);
    } catch (e) {
      sendUpdateLabelsErrorMessage();
    }
  };
};

export const removeLabelOnSuccess = labelId => {
  return {
    type: Label.REMOVE,
    labelId
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
      sendUpdateLabelsErrorMessage();
    }
  };
};

export const updateBadgeLabels = labelIds => {
  if (!labelIds.length) return;
  return async dispatch => {
    try {
      const labelsFiltered = labelIds.filter(labelId => {
        return (
          labelId === LabelType.inbox.id ||
          labelId === LabelType.spam.id ||
          labelId === LabelType.draft.id
        );
      });
      if (!labelsFiltered.length) return;
      const labels = await Promise.all(
        labelsFiltered.map(async labelId => {
          if (labelId === LabelType.inbox.id) {
            const [{ totalUnread }] = await getEmailsUnredByLabelId({
              labelId,
              rejectedLabelIds: [LabelType.spam.id, LabelType.trash.id]
            });
            const badgeInbox = totalUnread;
            updateDockBadgeApp(badgeInbox);
            return {
              id: String(labelId),
              badge: badgeInbox
            };
          } else if (labelId === LabelType.spam.id) {
            const [{ totalUnread }] = await getEmailsUnredByLabelId({
              labelId,
              rejectedLabelIds: [LabelType.trash.id]
            });
            const badgeSpam = totalUnread;
            return {
              id: String(labelId),
              badge: badgeSpam
            };
          } else if (labelId === LabelType.draft.id) {
            const badgeDraft = await getEmailsCounterByLabelId(labelId);
            return {
              id: String(labelId),
              badge: badgeDraft[0].count
            };
          }
        })
      );
      dispatch(updateBadgeLabelsSuccess(labels));
    } catch (e) {
      sendUpdateLabelsErrorMessage();
    }
  };
};

export const updateBadgeLabelsSuccess = labelIds => {
  return {
    type: Label.UPDATE_BADGE_LABELS,
    labelIds
  };
};

export const updateLabelSuccess = label => {
  return {
    type: Label.UPDATE,
    label
  };
};
