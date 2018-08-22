/* eslint-env node, jest */
const {
  filterCriptextRecipients,
  formOutgoingEmailFromData
} = require('./../EmailUtils');
const { appDomain } = require('./../const');

describe('[Form outgoing email] ', () => {
  it('Form outgoing email from data', () => {
    const labelId = 6;
    const composerData = {
      toEmails: [`toUser@${appDomain}`],
      ccEmails: [`ccUser@${appDomain}`],
      bccEmails: [`bccUser@${appDomain}`],
      textSubject: 'Subject',
      body: '<p>Hello</p>',
      files: [],
      labelId
    };

    const outgoingData = formOutgoingEmailFromData(composerData);
    outgoingData.emailData.email.date = 1524861748481;
    outgoingData.emailData.email.key = 1524861748481;
    expect(outgoingData).toMatchSnapshot();
  });
});

describe('[Filter emails by domain] ', () => {
  it('Filter emails by a different domain defined', () => {
    const recipients = [
      `userA@${appDomain}`,
      `userB@${appDomain}`,
      'userC@xxx.com'
    ];
    const filtered = filterCriptextRecipients(recipients);
    const result = [`userA@${appDomain}`, `userB@${appDomain}`];
    expect(filtered).toEqual(result);
  });
});
