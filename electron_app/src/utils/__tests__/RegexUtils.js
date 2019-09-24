/* eslint-env node, jest */
const { mailformedEventRegex, emailRegex } = require('./../RegexUtils');

describe('Regex Utils: Pending events: ', () => {
  it('Should match malformed events ', () => {
    const invalidStartComma =
      '{"cmd":304,"params":{"labelsAdded":["Spam"],"labelsRemoved":[],"threadIds":[,null]}}';
    const invalidBetweenComma =
      '{"cmd":304,"params":{"labelsAdded":["Starred"],"labelsRemoved":[],"threadIds":[,null,]}}';
    const invalidEndsComma =
      '{"cmd":304,"params":{"labelsAdded":["NotNull"],"labelsRemoved":[],"threadIds":[null,]}}';
    const invalidWithoutComma =
      '{"cmd":304,"params":{"labelsAdded":["nullable"],"labelsRemoved":[],"threadIds":[null]}}';

    expect(invalidStartComma.match(mailformedEventRegex)).not.toBe(null);
    expect(invalidBetweenComma.match(mailformedEventRegex)).not.toBe(null);
    expect(invalidEndsComma.match(mailformedEventRegex)).not.toBe(null);
    expect(invalidWithoutComma.match(mailformedEventRegex)).not.toBe(null);
  });

  it('Should not match wellformed events ', () => {
    const validAdded =
      '{"cmd":304,"params":{"labelsAdded":["null"],"labelsRemoved":[],"threadIds":["<1>"]}}';
    const validRemoved =
      '{"cmd":304,"params":{"labelsAdded":[],"labelsRemoved":["null"],"threadIds":["<2>"]}}';
    const validAddedAndRemoved =
      '{"cmd":304,"params":{"labelsAdded":["null"],"labelsRemoved":["null2"],"threadIds":["<3>"]}}';

    expect(validAdded.match(mailformedEventRegex)).toBeNull();
    expect(validRemoved.match(mailformedEventRegex)).toBeNull();
    expect(validAddedAndRemoved.match(mailformedEventRegex)).toBeNull();
  });
});

describe('Regex Utils: Email address: ', () => {
  it('Should match valid email addresses', () => {
    const validEmailAddresses = [
      'u@domain.com',
      'email@domain.com',
      'firstname.lastname@domain.com',
      'email@subdomain.domain.com',
      'firstname+lastname@domain.com',
      'email@123.123.123.123.com',
      'email@[123.123.123.123]',
      '"email"@domain.com',
      '1234567890@domain.com',
      'email@domain-one.com',
      '_______@domain.com',
      'email@domain.name',
      'email@domain.finance',
      'email@domain.co.jp',
      'firstname-lastname@domain.com',
      '1A2b3C_def45-moreletters.6789+=-@d0m41n.COM',
      'あいうえお@domain.com',
      'email@-domain.com',
      'reply+adelvyfdwyausnlpgjrihp53sytbxevbnhhb3iv4oy@reply.github.com'
    ];
    for (const emailAddress of validEmailAddresses) {
      expect(emailAddress.match(emailRegex)).not.toBe(null);
    }
  });

  it('Should not match invalid email addresses', () => {
    const invalidEmailAddresses = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@domain.com',
      'Joe Smith <email@domain.com>',
      'email.domain.com',
      'email@domain@domain.com',
      '.email@domain.com',
      'email.@domain.com',
      'email..email@domain.com',
      'email@domain.com (Joe Smith)',
      'email@domain',
      'email@111.222.333.44444',
      'email@domain..com'
    ];
    for (const emailAddress of invalidEmailAddresses) {
      expect(emailAddress.match(emailRegex)).toBe(null);
    }
  });
});
