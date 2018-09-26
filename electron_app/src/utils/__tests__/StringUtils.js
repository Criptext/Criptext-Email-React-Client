/* eslint-env node, jest */
const {
  cleanHTML,
  removeAppDomain,
  removeHTMLTags
} = require('./../StringUtils');
const { appDomain } = require('./../const');

describe('String Utils - Criptext Domain :', () => {
  it('Should remove Criptext Domain to Criptext email', () => {
    const email = `erika@${appDomain}`;
    const state = removeAppDomain(email);
    expect(state).toEqual('erika');
  });

  it('Should remove criptext domain to any email', () => {
    const email = 'erika@signal.com';
    const state = removeAppDomain(email);
    expect(state).toEqual(email);
  });
});

describe('String Utils - HTML Tags :', () => {
  it('Should remove HTML tags', () => {
    const text =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const numbers = '1, 2, 4';
    const test = `<br/><p>${text}</p><br/><br/><p><span>${text}</span><a>${numbers}</a></p>`;
    const state = removeHTMLTags(test);
    expect(state).toEqual(`${text} ${text} ${numbers}`);
  });
});

describe('String Utils - HTML style and script tags', () => {
  it('Should remove HTML tags: style and script with your content', () => {
    const text = 'Hello';
    const string = `<style type="text/css">...</style><script src="">xxx</script><style type="text/css">...</style><p>${text}&nbsp;<span>${text}</span>!</p><script src="">xxx</script>`;
    const stringCleaned = cleanHTML(string);
    const result = `${text} ${text} !`;
    expect(stringCleaned).toEqual(result);
  });
});
