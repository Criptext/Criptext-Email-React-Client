import { DEVICE_TYPE, IOS_TYPE, ANDROID_TYPE } from './const';

export const defineDeviceIcon = deviceType => {
  switch (deviceType) {
    case DEVICE_TYPE:
      return 'icon-desktop';
    case IOS_TYPE:
    case ANDROID_TYPE: {
      return 'icon-mobile';
    }
    default:
      return 'icon-desktop';
  }
};
