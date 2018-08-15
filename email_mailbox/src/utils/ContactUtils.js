import { appDomain } from './const';

const compareContacts = (recipient1, recipient2) => {
  if (!recipient1.name) {
    return recipient2.name
      ? 1
      : recipient1.email > recipient2.email
        ? 1
        : recipient1.email < recipient2.email
          ? -1
          : 0;
  }
  return !recipient2.name
    ? -1
    : recipient1.name > recipient2.name
      ? 1
      : recipient1.name > recipient2.name
        ? -1
        : 0;
};

export const matchOwnEmail = (myUsername, incomingEmail) =>
  `${myUsername}@${appDomain}` === incomingEmail;

export const orderContactsByNameOrEmail = recipients => {
  return recipients.sort(compareContacts);
};
