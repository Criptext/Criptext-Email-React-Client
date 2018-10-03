import React from 'react';
import { loadingType } from './../utils/electronInterface';
import LoadingWrapper from './LoadingWrapper';
import LinkingDevicesWrapper from './LinkingDevicesWrapper';

const loadingTypes = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  LINK_DEVICE: 'link'
};

const Panel = () => {
  switch (loadingType) {
    case loadingTypes.SIGNUP:
    case loadingTypes.LOGIN:
      return <LoadingWrapper loadingType={loadingType} />;
    case loadingTypes.LINK_DEVICE:
      return <LinkingDevicesWrapper />;
    default:
      break;
  }
};

export default Panel;
