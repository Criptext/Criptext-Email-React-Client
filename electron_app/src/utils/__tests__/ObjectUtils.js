/* eslint-env node, jest */

const { noNulls } = require('./../ObjectUtils');

describe('[Object Utils] ', () => {
  it(' Remove undefined and null fields from Object ', () => {
    const object = {
      id: '1',
      name: 'Julian',
      age: undefined,
      height: '180',
      weight: null
    };
    const expectedObject = {
      id: '1',
      name: 'Julian',
      height: '180'
    };
    const result = noNulls(object);
    expect(result).toEqual(expectedObject);
  });

  it(' Do not remove empty strings or zero values from Object ', () => {
    const object = {
      id: 0,
      name: 'Julian',
      lastName: '',
      speakFrench: false,
      age: undefined,
      record: null
    };
    const expectedObject = {
      id: 0,
      name: 'Julian',
      lastName: '',
      speakFrench: false
    };
    const result = noNulls(object);
    expect(result).toEqual(expectedObject);
  });
});
