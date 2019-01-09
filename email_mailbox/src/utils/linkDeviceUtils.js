import { deviceTypes } from './const';

export const defineDeviceIcon = deviceType => {
  switch (deviceType) {
    case deviceTypes.PC:
      return 'icon-desktop';
    case deviceTypes.IOS:
    case deviceTypes.ANDROID: {
      return 'icon-mobile';
    }
    default:
      return 'icon-desktop';
  }
};
