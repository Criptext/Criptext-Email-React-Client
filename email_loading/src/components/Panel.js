import React from 'react';
import LoadingWrapper from './LoadingWrapper';
import LinkNewDeviceWrapper from './LinkNewDeviceWrapper';
import LinkOldDeviceWrapper from './LinkOldDeviceWrapper';
import SyncMailboxWrapper from './SyncMailboxWrapper';
import {
  loadingType,
  mySettings,
  shouldResetPIN
} from '../utils/electronInterface';

const loadingTypes = {
  SIGNUP: 'signup',
  SIGNIN: 'signin',
  SIGNIN_NEW_PASSWORD: 'signin-new-password',
  LINK_NEW_DEVICE: 'link-new-device',
  LINK_OLD_DEVICE: 'link-old-device',
  LINK_DEVICE_REQUEST: 'link-device-request',
  SYNC_MAILBOX_REQUEST: 'sync-mailbox-request',
  SYNC_MAILBOX_OLD_DEVICE: 'sync-mailbox-old-device',
  INCOMPATIBLE_VERSIONS: 'incompatible-versions'
};

const Panel = () => (
  <div className="wrapper" data-theme={mySettings.theme || 'light'}>
    {renderDialog()}
  </div>
);

const renderDialog = () => {
  switch (loadingType) {
    case loadingTypes.SIGNUP:
    case loadingTypes.SIGNIN:
    case loadingTypes.SIGNIN_NEW_PASSWORD:
      return (
        <LoadingWrapper
          loadingType={loadingType}
          shouldResetPIN={shouldResetPIN}
        />
      );
    case loadingTypes.LINK_NEW_DEVICE:
      return <LinkNewDeviceWrapper shouldResetPIN={shouldResetPIN} />;
    case loadingTypes.SYNC_MAILBOX_REQUEST:
      return <SyncMailboxWrapper />;
    case loadingTypes.LINK_DEVICE_REQUEST:
    case loadingTypes.LINK_OLD_DEVICE:
      return <LinkOldDeviceWrapper />;
    default:
      return null;
  }
};

export { Panel as default, loadingTypes };
