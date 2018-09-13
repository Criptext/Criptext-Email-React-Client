/* eslint-env node, jest */
const { removeAppDomain, removeHTMLTags } = require('./../StringUtils');
const { appDomain } = require('./../const');

describe('String Utils - Criptext Domain :', () => {
  it('Remove Criptext Domain to Criptext email', () => {
    const email = `erika@${appDomain}`;
    const state = removeAppDomain(email);
    expect(state).toEqual('erika');
  });

  it('remove criptext domain to any email', () => {
    const email = 'erika@signal.com';
    const state = removeAppDomain(email);
    expect(state).toEqual(email);
  });
});

describe('String Utils - HTML Tags :', () => {
  it('Remove HTML tags', () => {
    const text =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const numbers = '1, 2, 4';
    const test = `<br/><p>${text}</p><br/><br/><p><span>${text}</span><a>${numbers}</a></p>`;
    const state = removeHTMLTags(test);
    expect(state).toEqual(`${text} ${text} ${numbers}`);
  });
});
