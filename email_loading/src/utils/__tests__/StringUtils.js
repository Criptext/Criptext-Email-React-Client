/* eslint-env node, jest */

import * as utils from '../StringUtils';

describe('String Utils - Signal Identifiers :', () => {
  it('Should separate recipient and deviceId (ideal case)', () => {
    const identifier = 'julian.1';
    const recipientIdExpected = 'julian';
    const deviceIdExpected = 1;
    const { recipientId, deviceId } = utils.splitSignalIdentifier(identifier);
    expect(recipientId).toEqual(recipientIdExpected);
    expect(deviceId).toEqual(deviceIdExpected);
  });

  it('Should separate recipient and deviceId (complex case)', () => {
    const identifier = 'julian.adams.2';
    const recipientIdExpected = 'julian.adams';
    const deviceIdExpected = 2;
    const { recipientId, deviceId } = utils.splitSignalIdentifier(identifier);
    expect(recipientId).toEqual(recipientIdExpected);
    expect(deviceId).toEqual(deviceIdExpected);
  });
});
