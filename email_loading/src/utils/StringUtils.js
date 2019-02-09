export const splitSignalIdentifier = identifier => {
  const parts = identifier.split('.');
  const deviceId = Number(parts.pop());
  const recipientId = parts.join('.');
  return { recipientId, deviceId };
};
