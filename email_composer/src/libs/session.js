import * as db from './../utils/electronInterface';

export const getKeyserverToken = async () => {
  const res = await db.getKeyserverToken();
  if (!res.length) {
    return undefined;
  }
  return res[0].keyserverToken;
};
