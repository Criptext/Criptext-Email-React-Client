import {
  getAllLabels,
  getEmailsCounterByLabelId,
  getEmailsUnredByLabelId,
  updateDockBadgeApp
} from './ipc';
import { LabelType } from './electronInterface';

export const defineLabels = async () => {
  const response = await getAllLabels();
  const rejectedLabelIds = [LabelType.spam.id, LabelType.trash.id];
  const unreadInbox = await getEmailsUnredByLabelId({
    labelId: LabelType.inbox.id,
    rejectedLabelIds
  });
  const badgeInbox = unreadInbox.length;
  updateDockBadgeApp(badgeInbox);
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
  return labels;
};
