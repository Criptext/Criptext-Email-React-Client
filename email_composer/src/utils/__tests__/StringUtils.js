/* eslint-env node, jest */

import * as utils from '../StringUtils.js';

describe('String Utils - Parse Separators :', () => {
  it('Parse email by separators', () => {
    const emailAndSeparators =
      'julian_adams@signal.com,erika@criptext.com;gianni-carlo@signal.com(daniel_tigse@signal.com)pedro_iniguez@criptext.com*gabriel@signal.com/allison@signal.com:natasha@criptext.com?julian@signal.com\njuan_piguave@signal.com\rerick@criptext.com';

    const parsedEmails = utils.pasteSplit(emailAndSeparators);
    expect(parsedEmails).toMatchSnapshot();
  });
});

describe('String Utils - Human File Size :', () => {
  it('Convert to human file sizes', () => {
    const bytesQuantities = [100, 1024, 1048576, 1007050824, 1002345687215];
    const converted = bytesQuantities.map(quantity => {
      return utils.convertToHumanSize(quantity, true);
    });
    expect(converted).toMatchSnapshot();
  });
});

describe('String Utils - HTML style and script tags', () => {
  it('Should remove HTML tags: style and script with your content', () => {
    const text = 'Hello';
    const string = `<style type="text/css">...</style><script src="">xxx</script><style type="text/css">...</style><p>${text}&nbsp;<span>${text}</span>!</p><script src="">xxx</script>`;
    const stringCleaned = utils.cleanHTML(string);
    const result = `${text} ${text} !`;
    expect(stringCleaned).toEqual(result);
  });
});

describe('String Utils - HTML Tags :', () => {
  it('Should remove HTML tags', () => {
    const text =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const numbers = '1, 2, 4';
    const test = `<br/><p>${text}</p><br/><br/><p><span>${text}</span><a>${numbers}</a></p>`;
    const state = utils.removeHTMLTags(test);
    expect(state).toEqual(`${text} ${text} ${numbers}`);
  });
});
