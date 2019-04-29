/* eslint-env node, jest */

import {
  formDataToEditDraft,
  formDataToReply,
  formOutgoingEmailFromData
} from './../EmailUtils';
import { emailKey, emailKeyWithFile } from './../__mocks__/electronInterface';
import { appDomain } from './../const';

jest.mock('./../../utils/const');
jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');

describe('Edit draft: ', () => {
  it('Should load a draft correctly', async () => {
    const dataToEdit = await formDataToEditDraft(emailKey);
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });
});

describe('Reply, Reply-all, Forward: ', () => {
  it('Should load an email to reply', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'reply');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });

  it('Should load an email to reply to all', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'reply-all');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });

  it('Should load an email to forward', async () => {
    const dataToEdit = await formDataToReply(emailKey, 'forward');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });

  it('Should load an email to forward: Load attachments', async () => {
    const dataToEdit = await formDataToReply(emailKeyWithFile, 'forward');
    dataToEdit.htmlBody = '<p>Modified body content</p>';
    expect(dataToEdit).toMatchSnapshot();
  });
});

describe('[Form outgoing email] ', () => {
  it('Should form outgoing email from data', () => {
    const labelId = 6;
    const composerData = {
      account: { id: 1 },
      toEmails: [`toUser@${appDomain}`],
      ccEmails: [`ccUser@${appDomain}`],
      bccEmails: [`bccUser@${appDomain}`],
      secure: true,
      textSubject: 'Subject',
      body: '<p>Hello</p>',
      files: [],
      labelId,
      status: 4
    };

    const outgoingData = formOutgoingEmailFromData(composerData);
    outgoingData.emailData.email.date = 1524861748481;
    outgoingData.emailData.email.key = 1524861748481;
    expect(outgoingData).toMatchSnapshot();
  });
});
