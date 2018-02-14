/* eslint-env node, jest */

import * as utils from '../StringUtils.js';

describe('string utils:', () => {
  it('remove actions from subject', () => {
    const actions = ['Re:', 'RE:', 'Forward:', '(RES)'];
    const subject = 'Re: RE: Forward: (RES) Hello';
    const state = utils.deleteSubstringsFirstPosition(actions, subject);
    expect(state).toMatchSnapshot();
  });
});
