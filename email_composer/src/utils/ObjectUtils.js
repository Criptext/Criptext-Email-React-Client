export const noNulls = object => {
  const obj = Object.assign({}, object);
  Object.keys(obj).forEach(
    key => (obj[key] === null || obj[key] === undefined) && delete obj[key]
  );
  return obj;
};