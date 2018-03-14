/* eslint-env node, jest */

import * as utils from '../ArrayUtils.js';

describe('array utils:', () => {
  it('recieve at least one full array', () => {
    const to = ['a'];
    const cc = [];
    const bcc = [];
    const state = utils.areEmptyAllArrays(to, cc, bcc);
    expect(state).toEqual(false);
  });

  it('receive all empty arrays', () => {
    const to = [];
    const cc = [];
    const bcc = [];
    const state = utils.areEmptyAllArrays(to, cc, bcc);
    expect(state).toEqual(true);
  });
});
