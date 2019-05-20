export const createObjectRecipientDomainIdByDevices = (
  sessions,
  recipientDomains,
  appDomain
) => {
  const domainRecipientDevices = recipientDomains.reduce(
    (result, recipientDomain) => {
      const domainRecipientDevice = result[recipientDomain.domain];
      if (!domainRecipientDevice) {
        return {
          ...result,
          [recipientDomain.domain]: buildDomainRecipientDevice(recipientDomain)
        };
      }
      return {
        ...result,
        [recipientDomain.domain]: addDomainRecipientDevice(
          domainRecipientDevice,
          recipientDomain
        )
      };
    },
    {}
  );

  const fullDomainRecipientDevices = sessions.reduce((result, item) => {
    const recipientDomain = item.recipientId
      ? item.recipientId.split('@')
      : [item.recipientId, appDomain];
    const username = recipientDomain[0];
    const domain = recipientDomain.length > 1 ? recipientDomain[1] : appDomain;
    const domainRecipientDevice = result[domain];
    if (!domainRecipientDevice) {
      return result;
    }
    const devices = item.deviceIds.split(',').map(Number);
    return {
      ...result,
      [domain]: addRecipientDevices(domainRecipientDevice, username, devices)
    };
  }, domainRecipientDevices);

  return Object.keys(fullDomainRecipientDevices).map(domain => {
    return fullDomainRecipientDevices[domain];
  });
};

const buildDomainRecipientDevice = recipientDomain => ({
  name: recipientDomain.domain,
  recipients: [recipientDomain.username],
  knownAddresses: {
    [recipientDomain.username]: []
  }
});

const addDomainRecipientDevice = (domainRecipientDevice, recipientDomain) => ({
  ...domainRecipientDevice,
  recipients: [...domainRecipientDevice.recipients, recipientDomain.username],
  knownAddresses: {
    ...domainRecipientDevice.knownAddresses,
    [recipientDomain.username]: []
  }
});

const addRecipientDevices = (
  domainRecipientDevice,
  recipientId,
  deviceIds
) => ({
  ...domainRecipientDevice,
  knownAddresses: {
    ...domainRecipientDevice.knownAddresses,
    [recipientId]: deviceIds
  }
});

export const filterRecipientsByBlacklisted = (
  blacklistedKnownDevices,
  knownAddresses,
  appDomain
) => {
  const knownAddressesFiltered = knownAddresses;
  const sessionIdentifiersToDelete = [];

  for (const item of blacklistedKnownDevices) {
    const username = item.name;
    const domain = item.domain;
    const deviceIds = item.devices;
    const recipientId =
      domain === appDomain ? username : `${username}@${appDomain}`;

    deviceIds.forEach(deviceId => {
      const sessionIdentifier = `${recipientId}.${deviceId}`;
      sessionIdentifiersToDelete.push(sessionIdentifier);
      const indexOf = knownAddressesFiltered[recipientId].indexOf(deviceId);
      knownAddressesFiltered[recipientId].splice(indexOf, 1);
    });
  }

  return { knownAddressesFiltered, sessionIdentifiersToDelete };
};
