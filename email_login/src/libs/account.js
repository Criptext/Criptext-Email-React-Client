import * as db from './../utils/electronInterface';

export const create = async ({
  recipientId,
  name,
  jwt,
  privKey,
  pubKey,
  registrationId
}) => {
  return await db.createAccount({
    recipientId,
    name,
    jwt,
    privKey,
    pubKey,
    registrationId
  });
};

export const getToken = async () => {
  const res = await db.getAccount();
  if (!res.length) {
    return undefined;
  }
  return res[0].jwt;
};

export const getIdentityKeyPair = async () => {
  const res = await db.getAccount();
  if (!res.length) {
    return undefined;
  }
  const result = {
    privKey: res[0].privKey,
    pubkey: res[0].pubKey
  };

  return result;
};

export const getRegistrationId = async () => {
  const res = await db.getAccount();
  if (!res.length) {
    return undefined;
  }
  return res[0].registrationId;
};
