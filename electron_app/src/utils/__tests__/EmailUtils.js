/* eslint-env node, jest */
const {
  filterCriptextRecipients,
  formOutgoingEmailFromData,
  getRecipientIdFromEmailAddressTag
} = require('./../EmailUtils');
const { appDomain } = require('./../const');

describe('[Form outgoing email] ', () => {
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
      labelId
    };

    const outgoingData = formOutgoingEmailFromData(composerData);
    outgoingData.emailData.email.date = 1524861748481;
    outgoingData.emailData.email.key = 1524861748481;
    expect(outgoingData).toMatchSnapshot();
  });
});

describe('[Filter emails by domain] ', () => {
  it('Should filter emails by a different domain defined', () => {
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

describe('[Get recipientId from EmailAddressTag] ', () => {
  it('Should get recipientId from criptext domain', () => {
    const from = `"Alice$$" <alice@${appDomain}>`;
    const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
    const result = 'alice';
    expect(recipientId).toEqual(result);
    expect(isExternal).toBeFalsy();
  });

  it('Should get recipientId from external domain', () => {
    const from = 'Bob 8989 <bob@domain.com>';
    const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
    const result = 'bob@domain.com';
    expect(recipientId).toEqual(result);
    expect(isExternal).toBeTruthy();
  });

  it('Should get recipientId from external domain, with name comma added', () => {
    const from = `Lola, <lola@domain.com>`;
    const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
    const result = 'lola@domain.com';
    expect(recipientId).toEqual(result);
    expect(isExternal).toBeTruthy();
  });

  it('Should get recipientId from external domain, with name as emailadresstag', () => {
    const from = `<alice@${appDomain}> <lola@domain.com>`;
    const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
    const result = 'lola@domain.com';
    expect(recipientId).toEqual(result);
    expect(isExternal).toBeTruthy();
  });

  it('Should get recipientId from external domain, with emailadresstag without tag', () => {
    const from = `alice@domain.com`;
    const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
    const result = 'alice@domain.com';
    expect(recipientId).toEqual(result);
    expect(isExternal).toBeTruthy();
  });
});
