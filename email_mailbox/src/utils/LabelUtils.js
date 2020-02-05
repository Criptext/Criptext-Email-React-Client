import { getAllLabels, getEmailsCounterByLabelId } from './ipc';
import { LabelType } from './electronInterface';

export const defineLabels = async () => {
  const response = await getAllLabels();
  const badgeDraft = await getEmailsCounterByLabelId(LabelType.draft.id);
  const labels = response.reduce(
    (result, element) => ({
      ...result,
      [element.id]: element
    }),
    {}
  );
  labels[LabelType.draft.id].badge = badgeDraft;
  return labels;
};
