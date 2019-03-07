/* eslint-env node, jest */
const { mailformedEventRegex } = require('./../RegexUtils');

describe('Regex Utils: ', () => {
  it(' Should match malformed events ', () => {
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

  it(' Should not match wellformed events ', () => {
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
