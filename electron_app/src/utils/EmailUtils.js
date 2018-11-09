const { emailRegex } = require('./RegexUtils');

const filterInvalidEmailAddresses = addresses => {
  return addresses.filter(address => emailRegex.test(address));
};

module.exports = { filterInvalidEmailAddresses };
