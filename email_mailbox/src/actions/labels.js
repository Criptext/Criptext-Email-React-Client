import { Label } from './types';
import {
  createLabel,
  deleteLabelById,
  getAllLabels,
  getEmailsUnredByLabelId,
  getEmailsCounterByLabelId,
  LabelType,
  postPeerEvent,
  updateDockBadge,
  updateLabel as updateLabelDB
} from '../utils/electronInterface';
import { sendUpdateLabelsErrorMessage } from './../utils/electronEventInterface';
import { SocketCommand } from '../utils/const';

export const addLabel = label => {
  return async dispatch => {
    try {
      const [labelId] = await createLabel(label);
      if (labelId) {
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
        const eventParams = {
          cmd: SocketCommand.PEER_LABEL_CREATED,
          params: { color }
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
      updateDockBadge(badgeInbox);
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
      sendUpdateLabelsErrorMessage();
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
            const rejectedLabelIds = [LabelType.spam.id, LabelType.trash.id];
            const unreadInbox = await getEmailsUnredByLabelId({
              labelId,
              rejectedLabelIds
            });
            const badgeInbox = unreadInbox.length;
            updateDockBadge(badgeInbox);
            return {
              id: String(labelId),
              badge: badgeInbox
            };
          } else if (labelId === LabelType.spam.id) {
            const unreadSpam = await getEmailsUnredByLabelId({
              labelId
            });
            const badgeSpam = unreadSpam.length;
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
