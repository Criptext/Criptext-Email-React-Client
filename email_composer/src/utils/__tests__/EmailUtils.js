/* eslint-env node, jest */

import { EditorState } from 'draft-js';
import {
  formOutgoingEmailFromData,
  formDataToFillComposer
} from './../EmailUtils';
import { emailKey } from './../__mocks__/electronInterface';
import { appDomain } from './../const';

jest.mock('./../../utils/electronInterface');

describe('Email utils:', () => {
  it('Form outgoing email from data', () => {
    const labelId = 6;
    const composerData = {
      toEmails: [`toUser@${appDomain}`],
      ccEmails: [`ccUser@${appDomain}`],
      bccEmails: [`bccUser@${appDomain}`],
      textSubject: 'Subject',
      htmlBody: EditorState.createEmpty()
    };

    const outgoingData = formOutgoingEmailFromData(composerData, labelId);
    outgoingData.data.email.date = 1524861748481;
    outgoingData.data.email.key = 1524861748481;
    expect(outgoingData).toMatchSnapshot();
  });

  it('Form data to edit draft', async () => {
    const dataToEdit = await formDataToFillComposer(emailKey);
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });
});
