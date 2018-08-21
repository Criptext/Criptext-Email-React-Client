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
