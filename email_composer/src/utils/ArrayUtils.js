export const areEmptyAllArrays = (to, cc, bcc) => {
  return to.length || cc.length || bcc.length ? false : true;
};

export const updateObjectFieldsInArray = (
  array,
  uniqueField,
  uniqueValue,
  newFields
) => {
  return array.reduce((result, item) => {
    if (item[uniqueField] && item[uniqueField] === uniqueValue) {
      return [...result, { ...item, ...newFields }];
    }
    return [...result, item];
  }, []);
};
