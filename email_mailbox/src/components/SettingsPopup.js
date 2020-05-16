import React from 'react';
import PropTypes from 'prop-types';
import PopupHOC from './PopupHOC';
import ChangePasswordPopup from './ChangePasswordPopup';
import ChangeRecoveryEmailPopup from './ChangeRecoveryEmailPopup';
import ChangeSecurityPinPopup from './ChangeSecurityPinPopup';
import DeleteAccountPopupWrapper from './DeleteAccountPopupWrapper';
import DeleteAliasPopup from './DeleteAliasPopup';
import DeleteCustomDomainPopup from './DeleteCustomDomainPopup';
import ExportBackupPopupWrapper from './ExportBackupPopupWrapper';
import ManualSyncPopup from './ManualSyncPopup';
import ManualSyncProcessPopup from './ManualSyncProcessPopup';
import SelectBackupFolderPopup from './SelectBackupFolderPopup';
import SetReplyToEmailPopup from './SetReplyToEmailPopup';
import TwoFactorAuthEnabledPopup from './TwoFactorAuthEnabledPopup';
import { SETTINGS_POPUP_TYPES } from './SettingAccountWrapper';
import UpgradeToPlusPopup from './UpgradeToPlusPopup';

const Changepasswordpopup = PopupHOC(ChangePasswordPopup);
const Changerecoveryemailpopup = PopupHOC(ChangeRecoveryEmailPopup);
const Changesecuritypinpopup = PopupHOC(ChangeSecurityPinPopup);
const Twofactorauthenabledpopup = PopupHOC(TwoFactorAuthEnabledPopup);
const Deleteaccountpopup = PopupHOC(DeleteAccountPopupWrapper);
const Deletealiaspopup = PopupHOC(DeleteAliasPopup);
const Deletecustomdomainpopup = PopupHOC(DeleteCustomDomainPopup);
const Exportbackuppopup = PopupHOC(ExportBackupPopupWrapper);
const Manualsyncpopup = PopupHOC(ManualSyncPopup);
const Manualsyncprocesspopup = PopupHOC(ManualSyncProcessPopup);
const SelectBackupFolder = PopupHOC(SelectBackupFolderPopup);
const SetReplyTo = PopupHOC(SetReplyToEmailPopup);
const Upgradetopluspopup = PopupHOC(UpgradeToPlusPopup);

const SettingsPopup = props => {
  const {
    CHANGE_PASSWORD,
    CHANGE_RECOVERY_EMAIL,
    CHANGE_SECURITY_PIN,
    DELETE_ACCOUNT,
    DELETE_ALIAS,
    DELETE_CUSTOM_DOMAIN,
    EXPORT_BACKUP,
    MANUAL_SYNC,
    MANUAL_SYNC_DEVICE_AUTHENTICATION,
    SELECT_BACKUP_FOLDER,
    SET_REPLY_TO,
    TWO_FACTOR_AUTH_ENABLED,
    UPGRADE_PLUS
  } = SETTINGS_POPUP_TYPES;

  switch (props.type) {
    case CHANGE_PASSWORD: {
      return (
        <Changepasswordpopup
          confirmNewPasswordInput={
            props.changePasswordPopupParams.confirmNewPasswordInput
          }
          isDisabledChangePasswordSubmitButton={
            props.changePasswordPopupParams.isDisabledChangePasswordSubmitButton
          }
          isHidden={props.isHidden}
          isLoading={props.changePasswordPopupParams.isLoading}
          newPasswordInput={props.changePasswordPopupParams.newPasswordInput}
          oldPasswordInput={props.changePasswordPopupParams.oldPasswordInput}
          onChangeInputValueChangePassword={
            props.onChangeInputValueChangePassword
          }
          onClickChangePasswordInputType={props.onClickChangePasswordInputType}
          onClickForgotPasswordLink={props.onClickForgotPasswordLink}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(CHANGE_PASSWORD);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          onConfirmChangePassword={props.onConfirmChangePassword}
        />
      );
    }
    case CHANGE_RECOVERY_EMAIL: {
      return (
        <Changerecoveryemailpopup
          isDisabledChangeRecoveryEmailSubmitButton={
            props.changeRecoveryEmailPopupParams
              .isDisabledChangeRecoveryEmailSubmitButton
          }
          isHidden={props.isHidden}
          onChangeInputValueOnChangeRecoveryEmailPopup={
            props.onChangeInputValueOnChangeRecoveryEmailPopup
          }
          onClickChangeRecoveryEmailInputType={
            props.onClickChangeRecoveryEmailInputType
          }
          onClickForgotPasswordLink={props.onClickForgotPasswordLink}
          onConfirmChangeRecoveryEmail={props.onConfirmChangeRecoveryEmail}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(CHANGE_RECOVERY_EMAIL);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          recoveryEmailPopupInputEmail={
            props.changeRecoveryEmailPopupParams.recoveryEmailInput
          }
          recoveryEmailPopupInputPassword={
            props.changeRecoveryEmailPopupParams.recoveryEmailPasswordInput
          }
          theme={'dark'}
        />
      );
    }
    case CHANGE_SECURITY_PIN: {
      return (
        <Changesecuritypinpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case DELETE_ACCOUNT: {
      return (
        <Deleteaccountpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case DELETE_ALIAS: {
      return (
        <Deletealiaspopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          onConfirmDeleteAlias={props.onConfirmDeleteAlias}
          {...props.deleteAliasParams}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case DELETE_CUSTOM_DOMAIN: {
      return (
        <Deletecustomdomainpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          onConfirmDeleteCustomDomain={props.onConfirmDeleteCustomDomain}
          {...props.deleteCustomDomainsParams}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case EXPORT_BACKUP: {
      return (
        <Exportbackuppopup
          isHidden={props.isHidden}
          onSetExportBackupPassword={props.onSetExportBackupPassword}
          onShowSettingsPopup={props.onShowSettingsPopup}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case MANUAL_SYNC: {
      return (
        <Manualsyncpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          onShowSettingsPopup={props.onShowSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case MANUAL_SYNC_DEVICE_AUTHENTICATION: {
      return (
        <Manualsyncprocesspopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          isClosable={false}
          theme={'dark'}
        />
      );
    }
    case SELECT_BACKUP_FOLDER: {
      return (
        <SelectBackupFolder
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          onSelectBackupFolder={props.onSelectBackupFolder}
          theme={'dark'}
        />
      );
    }
    case SET_REPLY_TO: {
      return (
        <SetReplyTo
          isDisabledSetReplyToSubmitButton={
            props.setReplyToPopupParams.isDisabledSubmitButton
          }
          isHidden={props.isHidden}
          isLoading={props.setReplyToPopupParams.isLoading}
          onChangeInputValueOnSetReplyTo={props.onChangeInputValueOnSetReplyTo}
          onConfirmSetReplyTo={props.onConfirmSetReplyTo}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(SET_REPLY_TO);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          setReplyToInput={props.setReplyToPopupParams.replyToInput}
          theme={'dark'}
        />
      );
    }
    case TWO_FACTOR_AUTH_ENABLED: {
      return (
        <Twofactorauthenabledpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case UPGRADE_PLUS: {
      return (
        <Upgradetopluspopup
          isHidden={props.isHidden}
          onClosePlusPopup={props.onClosePlusPopup}
          onTogglePopup={props.onClosePopup}
          onClickSection={props.onClickSection}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          type={props.upgradeToPlusType}
        />
      );
    }
    default:
      return null;
  }
};

SettingsPopup.propTypes = {
  changePasswordPopupParams: PropTypes.object,
  changeRecoveryEmailPopupParams: PropTypes.object,
  deleteAliasParams: PropTypes.object,
  deleteCustomDomainsParams: PropTypes.object,
  isHidden: PropTypes.bool,
  type: PropTypes.string,
  onChangeInputValueChangePassword: PropTypes.func,
  onChangeInputValueOnChangeRecoveryEmailPopup: PropTypes.func,
  onChangeInputValueOnSetReplyTo: PropTypes.func,
  onClearPopupParams: PropTypes.func,
  onClickChangePasswordInputType: PropTypes.func,
  onClickChangeRecoveryEmailInputType: PropTypes.func,
  onClickForgotPasswordLink: PropTypes.func,
  onClickSection: PropTypes.func,
  onClosePlusPopup: PropTypes.func,
  onClosePopup: PropTypes.func,
  onConfirmChangePassword: PropTypes.func,
  onConfirmChangeRecoveryEmail: PropTypes.func,
  onConfirmDeleteAlias: PropTypes.func,
  onConfirmDeleteCustomDomain: PropTypes.func,
  onConfirmSetReplyTo: PropTypes.func,
  onSelectBackupFolder: PropTypes.func,
  onSetExportBackupPassword: PropTypes.func,
  onShowSettingsPopup: PropTypes.func,
  setReplyToPopupParams: PropTypes.object,
  upgradeToPlusType: PropTypes.string
};

export default SettingsPopup;
