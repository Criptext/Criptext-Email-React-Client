/* eslint-env node, jest */

import * as utils from '../StringUtils.js';

describe('string utils:', () => {
  it('remove actions from subject', () => {
    const subject = 'Re: RE: Hello';
    const state = utils.removeActionsFromSubject(subject);
    expect(state).toEqual('Hello');
  });
});
