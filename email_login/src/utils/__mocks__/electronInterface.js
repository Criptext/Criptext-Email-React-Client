export const requiredMinLength = {
  username: 3,
  fullname: 1,
  password: 8
};

export const requiredMaxLength = {
  username: 255,
  fullname: 255,
  password: 255
};

export const prevUsername = 'julian';

export const checkAvailableUsername = username => {
  if (username === prevUsername) {
    return { status: 400 };
  }
  return { status: 200 };
};
