import React from 'react';
import LoadingWrapper from './LoadingWrapper';
import LinkNewDeviceWrapper from './LinkNewDeviceWrapper';
import LinkOldDeviceWrapper from './LinkOldDeviceWrapper';
import { loadingType } from '../utils/electronInterface';

const loadingTypes = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  LINK_NEW_DEVICE: 'link-new-device',
  LINK_OLD_DEVICE: 'link-old-device',
  LINK_DEVICE_REQUEST: 'link-device-request'
};

const Panel = () => {
  switch (loadingType) {
    case loadingTypes.SIGNUP:
    case loadingTypes.LOGIN:
      return <LoadingWrapper loadingType={loadingType} />;
    case loadingTypes.LINK_NEW_DEVICE:
      return <LinkNewDeviceWrapper />;
    case loadingTypes.LINK_DEVICE_REQUEST:
    case loadingTypes.LINK_OLD_DEVICE:
      return <LinkOldDeviceWrapper />;
    default:
      return null;
  }
};

export { Panel as default, loadingTypes };
