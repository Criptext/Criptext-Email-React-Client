import React from 'react';
import PropTypes from 'prop-types';
import ActivityPanel from './../containers/ActivityPanel';
import MainWrapper from './MainWrapper';
import SideBar from './../containers/SideBar';
import WelcomeWrapper from './WelcomeWrapper';
import PopupHOC from './PopupHOC';
import AccountDeletedPopup from './AccountDeletedPopup';
import CreatingBackupFilePopup from './CreatingBackupFilePopup';
import DeviceRemovedPopup from './DeviceRemovedPopup';
import MigrationPopupWrapper from './MigrationPopupWrapper';
import PasswordChangedPopupWrapper from './PasswordChangedPopupWrapper';
import RestoreBackupPopupWrapper from './RestoreBackupPopupWrapper';
import SuspendedAccountPopup from './SuspendedAccountPopup';
import UpdatePopup from './UpdatePopup';
import { MAILBOX_POPUP_TYPES } from './PanelWrapper';
import { mySettings } from '../utils/electronInterface';
import UserGuide from './UserGuide';
import './panel.scss';

const Panel = props => (
  <div
    className={
      'wrapper-in ' +
      defineWrapperClass(props.isOpenSideBar, props.isOpenActivityPanel)
    }
    data-theme={mySettings.theme || 'light'}
  >
    <div className="wrapper-left">
      <SideBar
        mailboxSelected={props.sectionSelected.params.mailboxSelected}
        onClickSection={props.onClickSection}
        onToggleSideBar={props.onToggleSideBar}
      />
      <MainWrapper
        onClickSection={props.onClickSection}
        onClickThreadBack={props.onClickThreadBack}
        onToggleActivityPanel={props.onToggleActivityPanel}
        sectionSelected={props.sectionSelected}
      />
    </div>
    <ActivityPanel
      onClickSection={props.onClickSection}
      onToggleActivityPanel={props.onToggleActivityPanel}
    />
    {props.isOpenWelcome &&
      !mySettings.opened && (
        <WelcomeWrapper onClickCloseWelcome={props.onClickCloseWelcome} />
      )}
    {!props.isHiddenMailboxPopup &&
      renderMailboxPopup({
        data: props.mailboxPopupData,
        type: props.mailboxPopupType,
        isHidden: props.isHiddenMailboxPopup,
        ...props
      })}
    <UserGuide />
  </div>
);

const renderMailboxPopup = ({ data, type, isHidden, ...props }) => {
  switch (type) {
    case MAILBOX_POPUP_TYPES.ACCOUNT_DELETED: {
      const Accountdeletedpopup = PopupHOC(AccountDeletedPopup);
      return (
        <Accountdeletedpopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.BIG_UPDATE_AVAILABLE: {
      const BigUpdatePopup = PopupHOC(UpdatePopup);
      return (
        <BigUpdatePopup
          {...data}
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          theme={'dark'}
          onUpdateNow={props.onUpdateNow}
          onTogglePopup={props.onCloseMailboxPopup}
          isClosable={true}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.CREATING_BACKUP_FILE: {
      const Creatingbackupfilepopup = PopupHOC(CreatingBackupFilePopup);
      return (
        <Creatingbackupfilepopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          isClosable={false}
          theme={'dark'}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.DEVICE_REMOVED: {
      const DeviceRemovedpopup = PopupHOC(DeviceRemovedPopup);
      return (
        <DeviceRemovedpopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.MIGRATE_ALICE: {
      const MigrationPopup = PopupHOC(MigrationPopupWrapper);
      return (
        <MigrationPopup
          isHidden={isHidden}
          isClosable={false}
          theme={'dark'}
          popupPosition={{ left: '50%', top: '50%' }}
          onCloseMailboxPopup={props.onCloseMailboxPopup}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.ONLY_BACKDROP: {
      return <div className="mailbox-linking-devices-backdrop" />;
    }
    case MAILBOX_POPUP_TYPES.PASSWORD_CHANGED: {
      const PasswordChangedpopup = PopupHOC(PasswordChangedPopupWrapper);
      return (
        <PasswordChangedpopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          isClosable={false}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.RESTORE_BACKUP: {
      const Restorebackuppopup = PopupHOC(RestoreBackupPopupWrapper);
      return (
        <Restorebackuppopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          isClosable={false}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.SUSPENDED_ACCOUNT: {
      const Suspendedaccountpopup = PopupHOC(SuspendedAccountPopup);
      return (
        <Suspendedaccountpopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          isClosable={false}
          theme={'dark'}
        />
      );
    }
    default:
      return null;
  }
};

const defineWrapperClass = (isOpenSideBar, isOpenActivityPanel) => {
  const sidebarClass = isOpenSideBar
    ? 'sidebar-app-expand'
    : 'sidebar-app-collapse';
  const navigationClass = isOpenActivityPanel
    ? ' navigation-feed-expand'
    : ' navigation-feed-collapse';
  return sidebarClass.concat(navigationClass);
};

renderMailboxPopup.propTypes = {
  data: PropTypes.object,
  onCloseMailboxPopup: PropTypes.func,
  onUpdateNow: PropTypes.func,
  isHidden: PropTypes.bool,
  props: PropTypes.object,
  type: PropTypes.string
};

Panel.propTypes = {
  isHiddenMailboxPopup: PropTypes.bool,
  isOpenActivityPanel: PropTypes.bool,
  isOpenSideBar: PropTypes.bool,
  isOpenWelcome: PropTypes.bool,
  mailboxPopupData: PropTypes.object,
  mailboxPopupType: PropTypes.string,
  onClickCloseWelcome: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default Panel;
