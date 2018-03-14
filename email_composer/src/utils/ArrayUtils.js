export const areEmptyAllArrays = (to, cc, bcc) => {
  return to.length || cc.length || bcc.length ? false : true;
};
