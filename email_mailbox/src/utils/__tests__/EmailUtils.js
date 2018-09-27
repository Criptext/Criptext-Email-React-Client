/* eslint-env node, jest */

import { defineRejectedLabels } from '../EmailUtils';
import { LabelType } from '../electronInterface';

jest.mock('./../../utils/electronInterface');

describe('Email utils: Define rejected labels ', () => {
  it('Define rejected labels for Spam label', () => {
    const labelId = LabelType.spam.id;
    const expectedResult = [LabelType.trash.id];
    const rejectedlabels = defineRejectedLabels(labelId);
    expect(rejectedlabels).toEqual(expectedResult);
  });

  it('Define rejected labels for Trash label', () => {
    const labelId = LabelType.trash.id;
    const expectedResult = [LabelType.spam.id];
    const rejectedlabels = defineRejectedLabels(labelId);
    expect(rejectedlabels).toEqual(expectedResult);
  });

  it('Define rejected labels for All mail label', () => {
    const labelId = LabelType.allmail.id;
    const expectedResult = [
      LabelType.spam.id,
      LabelType.trash.id,
      LabelType.draft.id
    ].sort();
    const rejectedlabels = defineRejectedLabels(labelId).sort();
    expect(rejectedlabels).toEqual(expectedResult);
  });

  it('Define rejected labels for another label', () => {
    const expectedRejectedlabels = [LabelType.spam.id, LabelType.trash.id];

    const inboxLabelId = LabelType.inbox.id;
    const inboxRejectedlabels = defineRejectedLabels(inboxLabelId).sort();

    const sentLabelId = LabelType.sent.id;
    const sentRejectedlabels = defineRejectedLabels(sentLabelId).sort();

    const draftLabelId = LabelType.draft.id;
    const draftRejectedlabels = defineRejectedLabels(draftLabelId).sort();

    const starredLabelId = LabelType.starred.id;
    const starredRejectedlabels = defineRejectedLabels(starredLabelId).sort();

    expect(inboxRejectedlabels).toEqual(expectedRejectedlabels);
    expect(sentRejectedlabels).toEqual(expectedRejectedlabels);
    expect(draftRejectedlabels).toEqual(expectedRejectedlabels);
    expect(starredRejectedlabels).toEqual(expectedRejectedlabels);
  });
});
