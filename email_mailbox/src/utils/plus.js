const CUSTOMER_TYPE = {
  STANDARD: 0,
  PLUS: 1,
  ENTERPRISE: 2,
  REDEEMED: 3,
  FAN: 5,
  HERO: 6,
  LEGEND: 7
};

export const isPlus = customerType => {
  return (
    customerType === 1 ||
    customerType === 5 ||
    customerType === 6 ||
    customerType === 7
  );
};

export const isEnterprise = customerType => {
  return customerType === 2;
};

export const canUpgrade = customerType => {
  return customerType === 0;
};

export const plusColor = customerType => {
  switch (customerType) {
    case CUSTOMER_TYPE.FAN:
      return '#6EA2CD';
    case CUSTOMER_TYPE.HERO:
      return '#7876F3';
    case CUSTOMER_TYPE.LEGEND:
      return '#E3A344';
    default:
      return '#FFFFFF00';
  }
};
