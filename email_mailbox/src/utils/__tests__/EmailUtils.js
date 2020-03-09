/* eslint-env node, jest */

import {
  addCollapseDiv,
  checkEmailIsTo,
  compareEmailDate,
  defineRejectedLabels,
  filterCriptextRecipients,
  getRecipientIdFromEmailAddressTag,
  getRecipientsFromData,
  cleanEmailBody
} from '../EmailUtils';
import { LabelType, myAccount } from '../electronInterface';
import { appDomain } from './../const';

jest.mock('./../../utils/const');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/ipc');

describe('Define rejected labels ', () => {
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

describe('Sort emails ', () => {
  it('Should sort emails by date', () => {
    const emails = [
      { date: '2018-10-04 21:46:55' },
      { date: '2018-10-04 21:36:55' },
      { date: '2018-10-04 21:26:55' }
    ];

    const result = emails.sort(compareEmailDate);
    expect(result).toEqual([
      { date: '2018-10-04 21:26:55' },
      { date: '2018-10-04 21:36:55' },
      { date: '2018-10-04 21:46:55' }
    ]);
  });
});

describe('Add collapse div ', () => {
  it('Should add div collpase to html with: <blockquote>', () => {
    const html =
      '<div><blockquote><p></p><br/><blockquote></blockquote></blockquote></div>';
    const result = addCollapseDiv(html, 1);
    expect(result).toMatchSnapshot();
  });

  it('Should add div collpase to html with: <div class="criptext_quote">', () => {
    const html =
      '<div class="criptext_quote"><blockquote><p></p><br/><blockquote></blockquote></blockquote></div>';
    const result = addCollapseDiv(html, 1);
    expect(result).toMatchSnapshot();
  });

  it('Should add div collpase to html with: <div class="gmail_quote">', () => {
    const html =
      '<div class="gmail_quote"><blockquote><p></p><br/><blockquote></blockquote></blockquote></div>';
    const result = addCollapseDiv(html, 1);
    expect(result).toMatchSnapshot();
  });
});

describe('Get recipientId from EmailAddressTag ', () => {
  it('Should get recipientId from criptext domain', () => {
    const from = `"Alice$$" <Alice@${appDomain}>`;
    const recipientId = getRecipientIdFromEmailAddressTag(from);
    const result = 'alice';
    expect(recipientId).toEqual(result);
  });

  it('Should get recipientId from external domain', () => {
    const from = 'Bob 8989 <Bob@domain.com>';
    const recipientId = getRecipientIdFromEmailAddressTag(from);
    const result = 'bob@domain.com';
    expect(recipientId).toEqual(result);
  });

  it('Should get recipientId from external domain, with name comma added', () => {
    const from = `Lola, <lola@domain.com>`;
    const recipientId = getRecipientIdFromEmailAddressTag(from);
    const result = 'lola@domain.com';
    expect(recipientId).toEqual(result);
  });

  it('Should get recipientId from external domain, with name as emailadresstag', () => {
    const from = `<alice@${appDomain}> <lola@domain.com>`;
    const recipientId = getRecipientIdFromEmailAddressTag(from);
    const result = 'lola@domain.com';
    expect(recipientId).toEqual(result);
  });

  it('Should get recipientId from external domain, with emailadresstag without tag', () => {
    const from = `alice@domain.com`;
    const recipientId = getRecipientIdFromEmailAddressTag(from);
    const result = 'alice@domain.com';
    expect(recipientId).toEqual(result);
  });
});

describe('Filter emails by domain ', () => {
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

describe('Sanitize emails ', () => {
  it('Should clear unauthorized tags', () => {
    const unsanitizedHtml = `<div><script>alert("I am a malicious script")</script><p>And I'm just a paragraph</p></div>`;
    const expectedHtml = `<div><p>And I'm just a paragraph</p></div>`;
    const sanitizedHtml = cleanEmailBody(unsanitizedHtml);
    expect(sanitizedHtml).toEqual(expectedHtml);
  });

  it('Should clear unauthorized attributes', () => {
    const unsanitizedTag = `<a href="http://www.criptext.com" onclick="execMaliciousScript()"> Link </a>`;
    const expectedTag = `<a href="http://www.criptext.com"> Link </a>`;
    const sanitizedTag = cleanEmailBody(unsanitizedTag);
    expect(sanitizedTag).toEqual(expectedTag);
  });

  it('Should not clear authorized schemes on attributes', () => {
    const unsanitizedTag = `<img src="http://www.domain.com/path/to/image.png" />`;
    const expectedTag = `<img src="http://www.domain.com/path/to/image.png" />`;
    const sanitizedTag = cleanEmailBody(unsanitizedTag);
    expect(sanitizedTag).toEqual(expectedTag);
  });

  it('Should clear unauthorized schemes on attributes', () => {
    const unsanitizedTag = `<img src="unknownScheme:data/format" alt="filename.jpg" />`;
    const expectedTag = `<img alt="filename.jpg" />`;
    const sanitizedTag = cleanEmailBody(unsanitizedTag);
    expect(sanitizedTag).toEqual(expectedTag);
  });
});

describe('Form recipients', () => {
  it('Should form recipients', () => {
    const data = {
      to: ['<test@criptext.com>'],
      cc: [
        'Name<>1 <test1@criptext.com>',
        '<error@criptext.com> <test2@criptext.com>',
        'error2@criptext.com <test3@criptext.com>'
      ],
      bcc: ['test4@criptext.com'],
      from: 'Name Surname <test5@criptext.com>'
    };
    const recipients = getRecipientsFromData(data);
    expect(recipients).toMatchSnapshot();

    const oldData = {
      to: '<test@criptext.com>',
      cc:
        'Name<>1 <test1@criptext.com>, <error@criptext.com> <test2@criptext.com>, error2@criptext.com <test3@criptext.com>',
      bcc: 'test4@criptext.com',
      from: 'Name Surname <test5@criptext.com>'
    };
    const oldRecipients = getRecipientsFromData(oldData);
    expect(oldRecipients).toMatchSnapshot();
  });
});

describe('Check email is: to me or from me', () => {
  it('Should valid email as to me', () => {
    const data = {
      to: ['<test@criptext.com>'],
      cc: [
        'Name<>1 <test1@criptext.com>',
        '<error@criptext.com> <test2@criptext.com>',
        'error2@criptext.com <test3@criptext.com>'
      ],
      bcc: ['test4@criptext.com'],
      from: 'Name Surname <test5@criptext.com>'
    };
    const recipients = getRecipientsFromData(data);
    const isToMe = checkEmailIsTo(recipients, myAccount.recipientId);
    expect(isToMe).toBeTruthy();
  });

  it('Should not valid email as to me', () => {
    const data = {
      to: ['<1test@criptext.com>'],
      cc: [
        'Name<>1 <test1@criptext.com>',
        '<error@criptext.com> <test2@criptext.com>',
        'error2@criptext.com <test3@criptext.com>'
      ],
      bcc: ['test4@criptext.com'],
      from: 'Name Surname <test5@criptext.com>'
    };
    const recipients = getRecipientsFromData(data);
    const isToMe = checkEmailIsTo(recipients, myAccount.recipientId);
    expect(isToMe).toBeFalsy();
  });
});
