/* eslint-env node, jest */

import { EditorState } from 'draft-js';
import {
  formOutgoingEmailFromData,
  formDataToEditDraft,
  formDataToReply
} from './../EmailUtils';
import { emailKey } from './../__mocks__/electronInterface';
import { appDomain } from './../const';

jest.mock('./../../utils/electronInterface');

describe('[Form outgoing email] ', () => {
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
});

describe('[Edit draft] ', () => {
  it('Form data to edit draft', async () => {
    const dataToEdit = await formDataToEditDraft(emailKey);
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });
});

describe('[Reply, Reply-all, Forward] ', () => {
  it('Form data to reply email', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'reply');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });

  it('Form data to reply-all', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'reply-all');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });

  it('Form data to forward', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'forward');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });
});
