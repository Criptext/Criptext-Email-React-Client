/* eslint-env node, jest */

import {
  formDataToEditDraft,
  formDataToReply,
  formOutgoingEmailFromData,
  parseEmailAddress
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

describe('Form outgoing email: ', () => {
  it('Should form outgoing email from data', () => {
    const labelId = 6;
    const composerData = {
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

describe('Parse email address: ', () => {
  it('Should parse object', () => {
    const emailObject = { name: 'User name', email: 'username@domain.com' };
    const result = parseEmailAddress(emailObject);
    expect(result).toMatchObject({
      name: emailObject.name,
      email: emailObject.email,
      complete: `${emailObject.name} <${emailObject.email}>`
    });
  });

  it('Should parse object, email address with uppercase', () => {
    const emailObject = { name: 'User name', email: 'usernAme@domain.com' };
    const result = parseEmailAddress(emailObject);
    expect(result).toMatchObject({
      name: emailObject.name,
      email: emailObject.email.toLowerCase(),
      complete: `${emailObject.name} <${emailObject.email.toLowerCase()}>`
    });
  });

  it('Should parse object with app domain and email address with uppercase', () => {
    const emailObject = { name: 'User name', email: `userName@${appDomain}` };
    const result = parseEmailAddress(emailObject);
    expect(result).toMatchObject({
      name: emailObject.name,
      email: emailObject.email.toLowerCase(),
      complete: `${emailObject.name} <${emailObject.email.toLowerCase()}>`
    });
  });

  it('Should parse text: email address', () => {
    const text = 'username@domain.com';
    const result = parseEmailAddress(text);
    expect(result).toMatchObject({
      name: undefined,
      email: text,
      complete: `<${text}>`
    });
  });

  it('Should parse text: email address tag', () => {
    const text = '<username@domain.com>';
    const textClean = text.replace(/<|>/g, '').trim();
    const result = parseEmailAddress(text);
    expect(result).toMatchObject({
      name: undefined,
      email: textClean,
      complete: textClean
    });
  });

  it('Should parse text: email address tag with name', () => {
    const text = 'User name <username@domain.com>';
    const result = parseEmailAddress(text);
    expect(result).toMatchObject({
      name: 'User name',
      email: 'username@domain.com',
      complete: text
    });
  });
});
