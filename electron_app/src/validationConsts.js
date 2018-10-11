const requiredMinLength = {
  username: 3,
  fullname: 1,
  password: 8
};

const requiredMaxLength = {
  username: 16,
  fullname: 255,
  password: 255
};

module.exports = {
  requiredMinLength,
  requiredMaxLength
};
