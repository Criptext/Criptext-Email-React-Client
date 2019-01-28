export const createObjectRecipientIdByDevices = sessions => {
  return sessions.reduce((result, item) => {
    if (!item.recipientId) {
      return result;
    }
    return {
      ...result,
      [item.recipientId]: item.deviceIds.split(',').map(Number)
    };
  }, {});
};

export const filterRecipientsByBlacklisted = (
  blacklistedKnownDevices,
  knownAddresses
) => {
  const knownAddressesFiltered = knownAddresses;
  const sessionIdentifiersToDelete = [];

  for (const item of blacklistedKnownDevices) {
    const recipientId = item.name;
    const deviceIds = item.devices;

    deviceIds.forEach(deviceId => {
      const sessionIdentifier = `${recipientId}.${deviceId}`;
      sessionIdentifiersToDelete.push(sessionIdentifier);
      const indexOf = knownAddressesFiltered[recipientId].indexOf(deviceId);
      knownAddressesFiltered[recipientId].splice(indexOf, 1);
    });
  }

  return { knownAddressesFiltered, sessionIdentifiersToDelete };
};
