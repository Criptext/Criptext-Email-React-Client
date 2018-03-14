/* eslint-env node, jest */

import * as utils from '../StringUtils.js';

describe('string utils:', () => {
  it('remove criptext domain to criptext email', () => {
    const email = 'erika@criptext.com';
    const state = utils.removeCriptextDomain(email);
    expect(state).toEqual('erika');
  });

  it('remove criptext domain to any email', () => {
    const email = 'erika@signal.com';
    const state = utils.removeCriptextDomain(email);
    expect(state).toEqual(email);
  });

  it('remove HTML tags', () => {
    const text =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const numbers = '1, 2, 4';
    const test = `<p><span>${text}</span><a>${numbers}</a></p>`;
    const state = utils.removeHTMLTags(test);
    expect(state).toEqual(text + numbers);
  });
});
