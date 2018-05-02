export const cleanUndefinedFields = object => {
  const obj = { ...object };
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key]);
  return obj;
};
