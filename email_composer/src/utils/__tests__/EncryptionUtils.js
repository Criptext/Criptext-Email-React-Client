/* eslint-env node, jest */

import * as utils from '../EncryptionUtils';

const appDomain = 'criptext.com';

const sessions = [
  {
    recipientId: 'erika',
    deviceIds: '1,5,6'
  },
  {
    recipientId: 'isabel@criptext.app',
    deviceIds: '3,4,5'
  }
];

const recipientDomains = [
  {
    recipientId: 'erika',
    username: 'erika',
    domain: 'criptext.com'
  },
  {
    recipientId: 'isabel@criptext.app',
    username: 'isabel',
    domain: 'criptext.app'
  }
];

const blacklistedKnownDevices = [
  {
    domain: 'criptext.com',
    name: 'erika',
    devices: [1, 5]
  },
  {
    domain: 'criptext.app',
    name: 'isabel',
    devices: [3, 4]
  }
];

describe('Methods to encrypt emails', () => {
  it('Should create object recipientId with its deviceIds', () => {
    const knownAddresses = utils.createObjectRecipientIdDomainByDevices(
      sessions,
      recipientDomains,
      appDomain
    );
    knownAddresses.sort((address1, address2) => address1.name > address2.name);
    expect(knownAddresses[0]).toMatchObject(
      expect.objectContaining({
        knownAddresses: { isabel: [3, 4, 5] },
        name: 'criptext.app',
        recipients: ['isabel']
      })
    );
    expect(knownAddresses[1]).toMatchObject(
      expect.objectContaining({
        knownAddresses: { erika: [1, 5, 6] },
        name: 'criptext.com',
        recipients: ['erika']
      })
    );
  });

  it('Should filter knownAddresses by blacklist', () => {
    const knownAddresses = utils.createObjectRecipientIdDomainByDevices(
      sessions,
      recipientDomains,
      appDomain
    );
    const {
      domainAddressesFiltered,
      sessionIdentifiersToDelete
    } = utils.filterRecipientsByBlacklisted(
      blacklistedKnownDevices,
      knownAddresses,
      appDomain
    );
    domainAddressesFiltered.sort(
      (address1, address2) => address1.name > address2.name
    );
    expect(domainAddressesFiltered[0]).toMatchObject(
      expect.objectContaining({
        knownAddresses: { isabel: [5] },
        name: 'criptext.app',
        recipients: ['isabel']
      })
    );
    expect(domainAddressesFiltered[1]).toMatchObject(
      expect.objectContaining({
        knownAddresses: { erika: [6] },
        name: 'criptext.com',
        recipients: ['erika']
      })
    );
    expect(sessionIdentifiersToDelete).toEqual([
      'erika.1',
      'erika.5',
      'isabel@criptext.com.3',
      'isabel@criptext.com.4'
    ]);
  });
});
