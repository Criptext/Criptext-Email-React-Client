/* eslint-env node, jest */

import { formDataToEditDraft, formDataToReply } from './../EmailUtils';
import { emailKey } from './../__mocks__/electronInterface';

jest.mock('./../../utils/electronInterface');

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
