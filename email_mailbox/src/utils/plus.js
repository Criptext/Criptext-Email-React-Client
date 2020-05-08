export const isPlus = customerType => {
  return customerType > 0 && customerType < 3;
};

export const isEnterprise = customerType => {
  return customerType === 2;
};
