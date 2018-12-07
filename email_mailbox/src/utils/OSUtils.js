export const getOS = () => {
  const osName = window.navigator.platform;
  return osName.split(' ')[0];
};

export const isWindows = () => {
  return getOS().toLowerCase() === 'win32';
};
