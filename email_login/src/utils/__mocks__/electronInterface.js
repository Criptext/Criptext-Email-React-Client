export const prevUsername = 'julian';

export const checkAvailableUsername = username => {
  if (username === prevUsername) {
    return { status: 400 };
  }
  return { status: 200 };
};
